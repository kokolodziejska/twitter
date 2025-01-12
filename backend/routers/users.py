from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import User
from db import get_db
from pydantic import BaseModel

router = APIRouter()  # Tworzymy router dla użytkowników

# Model danych dla logowania
class LoginRequest(BaseModel):
    username: str
    password: str

    
@router.post("/")
async def create_user(
    userName: str, 
    password: str, 
    phone: int, 
    email: str, 
    db: AsyncSession = Depends(get_db)
):
   # Usunięcie niecyfrowych znaków
    clean_phone = ''.join(filter(str.isdigit, phone))
    
    new_user = User(userName=userName, password=password, phone=phone, email=email)
    db.add(new_user)
    await db.commit()
    return {"userName": userName, "email": email}

@router.get("/")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


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


