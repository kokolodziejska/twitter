from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Message
from db import get_db
from pydantic import BaseModel
from datetime import datetime
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from sqlalchemy import select
from models import User
from pydantic import BaseModel



async def get_private_key_for_user(user_id: int, db: AsyncSession) -> str:
    result = await db.execute(select(User.privKey).where(User.userId == user_id))
    private_key = result.scalar_one_or_none()
    if not private_key:
        raise HTTPException(status_code=404, detail="Private key not found for user.")
    return private_key


def generate_signature(private_key: str, message: str) -> str:
    try:
        private_key_obj = serialization.load_pem_private_key(
            private_key.encode(),
            password=b"DawnoDawnotemuWOdleglejGalaktyce"  
        )
        signature = private_key_obj.sign(
            message.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return signature.hex()
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid private key format.")
    except TypeError as e:
        raise HTTPException(status_code=400, detail="Invalid message type for signing.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate signature: {str(e)}")


router = APIRouter()  

class CreateMessageRequest(BaseModel):
    message: str
    image: str | None = None  # Obraz jest opcjonalny
    doSign: bool 

class MessageResponse(BaseModel):
    id: int 
    userId: int
    userName: str
    message: str
    image: str | None 
    date: datetime
    signature: str | None

  
@router.post("/add", response_model=MessageResponse)
async def create_message(
    message_data: CreateMessageRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    try:
        
        session_id = request.cookies.get("sessionId")

        if not session_id:
            raise HTTPException(status_code=401, detail="User not authenticated")

        result = await db.execute(select(User).where(User.tempSessionId == session_id))
        user = result.scalars().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Obsługa podpisu
        signature = None
        if message_data.doSign:
            private_key = await get_private_key_for_user(user.userId, db)
            signature = generate_signature(private_key, request.message)

        # Tworzenie nowej wiadomości
        new_message = Message(
            userId=user.userId,
            userName=user.userName,
            message=message_data.message,
            image=message_data.image if message_data.image else None,
            date=datetime.utcnow(),
            signature=signature
        )
        db.add(new_message)
        await db.commit()
        await db.refresh(new_message)

        return new_message
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload


from sqlalchemy.orm import aliased

@router.get("/", response_model=list[MessageResponse])
async def get_all_messages(db: AsyncSession = Depends(get_db)):
    try:
       
        query = (
            select(
                Message.id,
                Message.message,
                Message.image,
                Message.date,
                Message.userId,
                Message.userName,
                Message.signature,
                
            )
            .order_by(Message.date.desc())
        )
        result = await db.execute(query)
        messages = result.fetchall()

     
        response = [
            {
                "id": msg.id,
                "message": msg.message,
                "image": msg.image,
                "date": msg.date,
                "userId": msg.userId, 
                "userName": msg.userName,
                "signature": msg.signature
            }
            for msg in messages
        ]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    


@router.post("/user", response_model=list[MessageResponse])
async def get_user_messages(
     request: Request,
    db: AsyncSession = Depends(get_db)
):
    try:
        session_id = request.cookies.get("sessionId")

        if not session_id:
            raise HTTPException(status_code=401, detail="User not authenticated")

        result = await db.execute(select(User).where(User.tempSessionId == session_id))
        user = result.scalars().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # Pobieranie wiadomości użytkownika na podstawie userId
        query = (
            select(
                Message.id,
                Message.message,
                Message.image,
                Message.date,
                Message.userId,
                Message.userName,
                Message.signature,
            )
            .where(Message.userId == user.userId)  
            .order_by(Message.date.desc())           # Sortowanie według daty malejąco
        )
        result = await db.execute(query)
        messages = result.fetchall()

      
        response = [
            {
                "id": msg.id,
                "message": msg.message,
                "image": msg.image,
                "date": msg.date,
                "userId": msg.userId,
                "userName": msg.userName,
                "signature": msg.signature,
            }
            for msg in messages
        ]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
    






