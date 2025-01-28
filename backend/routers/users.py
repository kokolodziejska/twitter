from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import User
from db import get_db
from pydantic import BaseModel
from argon2 import PasswordHasher
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import os

from dotenv import load_dotenv



def load_public_key(pem_key: str):
    try:
        public_key = serialization.load_pem_public_key(
            pem_key.encode()  # Zamiana klucza na bajty, jeśli jest w formacie string
        )
        return public_key
    except Exception as e:
        raise ValueError(f"Failed to load public key: {str(e)}")

router = APIRouter()  # Tworzymy router dla użytkowników
ph = PasswordHasher(
    time_cost=3,      # Liczba iteracji (czas obliczeń)
    memory_cost=65536, # Ilość pamięci (w KB)
    parallelism=4,    # Liczba wątków
)

# Załaduj zmienne środowiskowe z pliku .env
load_dotenv()

# Pobierz hasło do szyfrowania z pliku .env 
ENCRYPTION_PASSWORD = os.getenv("RSA_ENCRYPTION_PASSWORD", "default_password")


# Funkcja generująca klucze RSA
def generate_keys():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.BestAvailableEncryption(ENCRYPTION_PASSWORD.encode())
    )

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return private_pem.decode(), public_pem.decode()

class CreateUserRequest(BaseModel):
    userName: str
    password: str
    phone: str
    email: str
    
@router.post("/add")
async def create_user(
    request: CreateUserRequest,  # Korzystamy z modelu Pydantic
    db: AsyncSession = Depends(get_db)
):
    try:
        # Usunięcie niecyfrowych znaków z numeru telefonu
        clean_phone = ''.join(filter(str.isdigit, request.phone))
        
        # Hashowanie hasła użytkownika
        hashed_password = ph.hash(request.password)
        
        # Generowanie kluczy RSA
        private_key, public_key = generate_keys()
        
        # Tworzenie użytkownika
        new_user = User(
            userName=request.userName,
            password=hashed_password,
            phone=clean_phone,
            email=request.email,
            privKey=private_key,  
            pubKey=public_key
        )
        db.add(new_user)
        await db.commit()

        return {"message": "User created successfully.", "userName": request.userName}
    except Exception as e:
        # Rollback na wypadek błędu
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.get("/")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

class UserName(BaseModel):
    userName: str

@router.post("/email")
async def get_email(data: UserName, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.userName == data.userName))
    user = result.scalars().first()
    if user:
        return {"email": user.email}
    return {"message": "User not found"}

@router.post("/phone")
async def get_phone(data: UserName, db: AsyncSession = Depends(get_db)):
     result = await db.execute(select(User).filter(User.userName == data.userName))
     user = result.scalars().first()
     if user:
        return {"phone": user.phone}
     return {"message": "User not found"}
 
@router.post("/pubKey")
async def get_public_key(data: UserName, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).filter(User.userName == data.userName))
        user = result.scalars().first()

        if user and user.pubKey:
            # Odczytaj klucz publiczny z formatu PEM
            public_key = load_public_key(user.pubKey)
            return {"publicKey": user.pubKey}

        return {"message": "User not found or no public key available"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    except Exception as e:
        
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# Modele zapytań
class UsernameCheckRequest(BaseModel):
    username: str

class EmailCheckRequest(BaseModel):
    email: str

class PhoneNumberCheckRequest(BaseModel):
    phone_number: str



# Sprawdzanie dostępności nazwy użytkownika
@router.post("/check-username")
async def check_username_availability(
    request: UsernameCheckRequest, 
    db: AsyncSession = Depends(get_db)
):
    try:
        username = request.username
        # Zapytanie do bazy danych, aby sprawdzić, czy użytkownik istnieje
        result = await db.execute(select(User).filter(User.userName == username))
        user = result.scalar()
        
        # Jeśli użytkownik istnieje, informuje że nazwa jest zajęta
        if user:
            return {"available": False}
        
        # Jeśli użytkownik nie istnieje, informuje że nazwa jest dostępna
        return {"available": True}
    
    except Exception as e:
        # Obsługa błędu połączenia z bazą danych
        raise HTTPException(status_code=500, detail="Database connection error")

class CheckEmailForUserRequest(BaseModel):
    userName: str
    email: str
    
@router.post("/check-email-for-user")
async def check_email_for_user(
    request: CheckEmailForUserRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Zapytanie do bazy, aby znaleźć użytkownika o podanej nazwie
        result = await db.execute(select(User).filter(User.userName == request.userName))
        user = result.scalar_one_or_none()

        # Sprawdzenie, czy użytkownik istnieje i czy e-mail jest zgodny
        if user:
            if user.email == request.email:
                return {"emailMatches": True}
            else:
                return {"emailMatches": False}

        # Jeśli użytkownik nie istnieje, zwróć odpowiednią informację
        return {"message": "User not found"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Sprawdzanie dostępności e-maila
@router.post("/check-email")
async def check_email_availability(
    request: EmailCheckRequest, 
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(User).filter(User.email == request.email))
        user = result.scalar_one_or_none()
        if user:
            return {"available": False}
        return {"available":True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Sprawdzanie dostępności numeru telefonu
@router.post("/check-phone-number")
async def check_phone_number_availability(
    request: PhoneNumberCheckRequest, 
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(User).filter(User.phone == request.phone_number))
        user = result.scalar_one_or_none()
        if user:
            return {"available": False}
        return {"available": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/id", response_model=int)
async def get_user_id(username: str, db: AsyncSession = Depends(get_db)):
    try:
        # Zapytanie do bazy danych
        result = await db.execute(select(User).filter(User.userName == username))
        user = result.scalars().first()

        # Sprawdzenie, czy użytkownik istnieje
        if not user:
            print(f"User not found for username: {username}")
            raise HTTPException(status_code=404, detail="User not found")

        # Logowanie znalezionego ID
        print(f"User found: {user.userId}")
        return user.userId  # Zwróć userId
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# Model danych dla żądania zmiany hasła
class ChangePasswordRequest(BaseModel):
    userName: str
    newPassword: str

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest, 
    db: AsyncSession = Depends(get_db)
):
    try:
        # Sprawdzenie, czy użytkownik istnieje
        result = await db.execute(select(User).filter(User.userName == request.userName))
        user = result.scalars().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        # Hashowanie nowego hasła
        hashed_password = ph.hash(request.newPassword)

        # Aktualizacja hasła użytkownika
        user.password = hashed_password
        db.add(user)
        await db.commit()

        return {"message": "Password changed successfully."}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    
from fastapi import HTTPException


