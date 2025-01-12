from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models import User
from ..db import get_db
from pydantic import BaseModel

router = APIRouter()  # Tworzymy router dla użytkowników

# Model danych dla logowania
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/users/")
async def create_user(
    userName: str, 
    password: str, 
    phone: int, 
    email: str, 
    db: AsyncSession = Depends(get_db)
):
    new_user = User(userName=userName, password=password, phone=phone, email=email)
    db.add(new_user)
    await db.commit()
    return {"userName": userName, "email": email}

@router.get("/users/")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

from fastapi import HTTPException


