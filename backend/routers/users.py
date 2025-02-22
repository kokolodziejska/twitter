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
import re
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
import base64
from fastapi import Request, Response
import uuid
from fastapi.responses import StreamingResponse



def validate_phone(phone: str):
    clean_phone = re.sub(r"[^\d]", "", phone)  
    if not 9 <= len(clean_phone) <= 15:
        raise HTTPException(
            status_code=400,
            detail="Phone number must be between 9 and 15 digits."
        )
    return clean_phone

def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        )
    if not any(char.islower() for char in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter."
        )
    if not any(char.isupper() for char in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter."
        )
    if not any(char.isdigit() for char in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one digit."
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one special character."
        )
    return password


def validate_username(username: str):
    if not 3 <= len(username) <= 30:
        raise HTTPException(
            status_code=400,
            detail="Username must be between 3 and 30 characters."
        )
    return username


def validate_email_format(email: str):
    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"  
    if not re.match(email_regex, email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email format."
        )
    return email



def load_public_key(pem_key: str):
    try:
        public_key = serialization.load_pem_public_key(
            pem_key.encode()  # Zamiana klucza na bajty, jeśli jest w formacie string
        )
        return public_key
    except Exception as e:
        raise ValueError(f"Failed to load public key: {str(e)}")

router = APIRouter()  
ph = PasswordHasher(
    time_cost=3,      # Liczba iteracji (czas obliczeń)
    memory_cost=65536, # Ilość pamięci (w KB)
    parallelism=4,    # Liczba wątków
)


load_dotenv()

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
    request: CreateUserRequest,  
    db: AsyncSession = Depends(get_db)
):
    try:
         
        # Usunięcie niecyfrowych znaków z numeru telefonu
        clean_phone = ''.join(filter(str.isdigit, request.phone))
        
        # Hashowanie hasła użytkownika
        hashed_password = ph.hash(validate_password(request.password))
        
        # Generowanie kluczy RSA
        private_key, public_key = generate_keys()
        
        # Tworzenie użytkownika
        new_user = User(
            userName=validate_username(request.userName),
            password=hashed_password,
            phone=validate_phone(clean_phone),
            email=validate_email_format(request.email),
            privKey=private_key,  
            pubKey=public_key
        )
        db.add(new_user)
        await db.commit()

        return {"message": "User created successfully.", "userName": request.userName}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/me")
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Wyszukanie użytkownika na podstawie sesji
    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "userId": user.userId,
        "userName": user.userName,
        "message": "User authenticated successfully"
    }


@router.get("/email-me")
async def get_email(request: Request, db: AsyncSession = Depends(get_db)):
    
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user:
        return {"email": user.email}
    return {"message": "User not found"}

@router.get("/phone-me")
async def get_phone(request: Request, db: AsyncSession = Depends(get_db)):
    
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user:
        return {"phone": user.phone}
    
    return {"message": "User not found"}
 
@router.get("/pubKey-me")
async def get_public_key(request: Request, db: AsyncSession = Depends(get_db)):
   
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user and user.pubKey:
        public_key = load_public_key(user.pubKey)
        return {"publicKey": user.pubKey}

    return {"message": "User not found or no public key available"}

class UsernameCheckRequest(BaseModel):
    username: str
    
# Sprawdzanie dostępności nazwy użytkownika
@router.post("/check-username")
async def check_username_availability(
    request: UsernameCheckRequest, 
    db: AsyncSession = Depends(get_db)
):
    try:
        username = request.username
        result = await db.execute(select(User).filter(User.userName == username))
        user = result.scalar()     
        
        if user:
            return {"available": False}
        
        return {"available": True}
    
    except Exception as e:
    
        raise HTTPException(status_code=500, detail="Database connection error")

class CheckEmailForUserRequest(BaseModel):
    userName: str
    email: str
    
@router.post("/check-email-for-user")
async def check_email_for_user(
    email_data: CheckEmailForUserRequest,  
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(User).where(User.userName == email_data.userName))
        user = result.scalar_one_or_none()

        if not user:
            return {"emailMatches": False, "message": "User not found"}

        if user.email == email_data.email:
            
            sessionId = str(uuid.uuid4())
            user.tempSessionId = sessionId
            await db.commit()

            response.set_cookie("sessionId", sessionId, httponly=True, secure=True, samesite="None")
            return {"emailMatches": True}

        return {"emailMatches": False}

    except Exception as e:
        await db.rollback()  # Cofnięcie zmian w razie błędu
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

class ChangePasswordRequest(BaseModel):
    newPassword: str

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest, 
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    try:
        session_id = request.cookies.get("sessionId")

        if not session_id:
            raise HTTPException(status_code=401, detail="Not authenticated")

        result = await db.execute(select(User).where(User.tempSessionId == session_id))
        user = result.scalars().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        hashed_password = ph.hash(password_data.newPassword)

        user.password = hashed_password
        db.add(user)
        
        newsessionId = str(uuid.uuid4())
        user.tempSessionId = newsessionId
        await db.commit()
        
        response.set_cookie(
            key="sessionId",
            value=newsessionId,
            httponly=True,
            secure=True,
            samesite="None"
        )

        return {"message": "Password changed successfully."}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
from fastapi import HTTPException

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


class EmailCheckRequest(BaseModel):
    email: str

class PhoneNumberCheckRequest(BaseModel):
    phone_number: str


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
        result = await db.execute(select(User).filter(User.userName == username))
        user = result.scalars().first()

        if not user:
            print(f"User not found for username: {username}")
            raise HTTPException(status_code=404, detail="User not found")

        print(f"User found: {user.userId}")
        return user.userId  
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/set-mail-code")
async def set_mail_code(request: Request, mail_code: int, db: AsyncSession = Depends(get_db)):
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.mailCode = mail_code
    await db.commit()

    return {"message": "Mail code updated successfully", "mailCode": mail_code}

@router.post("/verify-mail-code")
async def verify_mail_code(request: Request, mail_code: int, db: AsyncSession = Depends(get_db)):
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user or user.mailCode is None:
        raise HTTPException(status_code=404, detail="User not found or mail code not set")

    if user.mailCode != mail_code:
        raise HTTPException(status_code=400, detail="Invalid mail code")

    return {"message": "Mail code is correct"}

