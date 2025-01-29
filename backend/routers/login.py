from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import User
from db import get_db
from pydantic import BaseModel
from argon2 import PasswordHasher
from datetime import datetime, timedelta
from argon2.exceptions import VerifyMismatchError
import pyotp
import qrcode
from io import BytesIO
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException, Response
import uuid
from fastapi import Request

ph = PasswordHasher(
    time_cost=3,      # Liczba iteracji (czas obliczeń)
    memory_cost=65536, # Ilość pamięci (w KB)
    parallelism=4,    # Liczba wątków
)
router = APIRouter() 


async def get_user_from_session(request: Request, db: AsyncSession):

    user_id = request.cookies.get("userId")

    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    result = await db.execute(select(User).where(User.userId == int(user_id)))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


class LoginRequest(BaseModel):
    userName: str
    password: str

@router.post("/")
async def login_user(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):

    MAX_ATTEMPTS = 5
    LOCK_DURATION = timedelta(minutes=5)
    
    print(f"Received login request: userName={data.userName}, password={data.password}")
    result = await db.execute(select(User).where(User.userName == data.userName))
    user = result.scalars().first()

    if not user:
        print("User not found!")
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.failedAttempts >= MAX_ATTEMPTS:
        if user.last and datetime.utcnow() - user.last < LOCK_DURATION:
            raise HTTPException(
                status_code=403,
                detail="Account is locked. Try again later."
        )
        else:
            user.failedAttempts = 0
            await db.commit()
            
    try:
        ph.verify(user.password, data.password)  # Hasło podane przez użytkownika
        user.failedAttempts = 0
        user.last = datetime.utcnow()
        await db.commit()
        print("Password is correct!")
    
        sessionId = str(uuid.uuid4())
        user.tempSessionId = sessionId
        await db.commit()

        response.set_cookie("sessionId", sessionId, httponly=True, secure=True, samesite="None")
        
        return {
            "message": "Login successful. Proceed to 2FA verification."
        }
    
    except VerifyMismatchError:
        user.failedAttempts += 1 
        user.last = datetime.utcnow()
        await db.commit()
        print("Password is incorrect.")
        if user.failedAttempts >= MAX_ATTEMPTS:
             raise HTTPException(
                status_code=403,
                detail="Account is locked for 5 minutes due to multiple failed attempts."
            )
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    except Exception as e:
        print(f"Unexpected error during login: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during login.")
        

@router.post("/enable-totp")
async def enable_totp(request: Request, db: AsyncSession = Depends(get_db)):
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.totpSecret:
        raise HTTPException(status_code=400, detail="TOTP is already configured for this user")

    
    totp_secret = pyotp.random_base32()
    user.totpSecret = totp_secret
    await db.commit()

    totp = pyotp.TOTP(totp_secret)
    qr_url = totp.provisioning_uri(name=user.userName, issuer_name="YourAppName")

    qr = qrcode.make(qr_url)
    buf = BytesIO()
    qr.save(buf)
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


@router.post("/verify-totp")
async def verify_totp(code: int, request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    session_id = request.cookies.get("sessionId")

    if not session_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    result = await db.execute(select(User).where(User.tempSessionId == session_id))
    user = result.scalars().first()

    if not user or not user.totpSecret:
        raise HTTPException(status_code=404, detail="User not found or TOTP not configured")

    # Weryfikacja kodu TOTP
    totp = pyotp.TOTP(user.totpSecret)
    if not totp.verify(str(code)):  # TOTP.verify wymaga stringa, więc konwertujemy int na string
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    
    
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

    return {"message": "2FA verification successful."}