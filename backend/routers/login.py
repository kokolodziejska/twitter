from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import User
from db import get_db
from pydantic import BaseModel
from argon2 import PasswordHasher

ph = PasswordHasher(
    time_cost=3,      # Liczba iteracji (czas obliczeń)
    memory_cost=65536, # Ilość pamięci (w KB)
    parallelism=4,    # Liczba wątków
)
router = APIRouter()  # This router will now handle all login-related endpoints

# Model for login requests
class LoginRequest(BaseModel):
    userName: str
    password: str

@router.post("/")
async def login_user(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    
    print(f"Received login request: userName={data.userName}, password={data.password}")
    result = await db.execute(select(User).where(User.userName == data.userName))
    user = result.scalars().first()

    if not user:
        print("User not found!")
        raise HTTPException(status_code=404, detail="User not found")
    try:
        ph.verify(user.password, data.password)  # Hasło podane przez użytkownika
        print("Password is correct!")
        return {"message": "Login successful", "userName": user.userName}
    
    except Exception:
        print("Password is incorrect.")
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    

    
