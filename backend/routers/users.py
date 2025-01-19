from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import User
from db import get_db
from pydantic import BaseModel
from argon2 import PasswordHasher


router = APIRouter()  # Tworzymy router dla użytkowników
ph = PasswordHasher(
    time_cost=3,      # Liczba iteracji (czas obliczeń)
    memory_cost=65536, # Ilość pamięci (w KB)
    parallelism=4,    # Liczba wątków
)

# Model danych dla logowania
class LoginRequest(BaseModel):
    username: str
    password: str

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
        
        hashed_password = ph.hash(request.password)
        
        # Tworzenie użytkownika
        new_user = User(
            userName=request.userName,
            password=hashed_password,
            phone=clean_phone,
            email=request.email
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
        return {"email": user.phone}
     return {"message": "User not found"}


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
        return {"available": True}
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
    
    
from fastapi import HTTPException


