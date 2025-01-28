from fastapi import APIRouter, Depends, HTTPException
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


router = APIRouter()  # Router dla wiadomości

# Model danych dla wiadomości
class CreateMessageRequest(BaseModel):
    userId: int
    userName: str
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

  


# Endpoint do tworzenia nowej wiadomości
@router.post("/add", response_model=MessageResponse)
async def create_message(
    request: CreateMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Obsługa podpisu
        signature = None
        if request.doSign:
            private_key = await get_private_key_for_user(request.userId, db)
            signature = generate_signature(private_key, request.message)

        # Tworzenie nowej wiadomości
        new_message = Message(
            userId=request.userId,
            userName=request.userName,
            message=request.message,
            image=request.image if request.image else None,
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
        # Pobieranie wiadomości z sortowaniem według daty malejąco
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

        # Formatowanie danych w odpowiedniej strukturze
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
    
    
class UserMessagesRequest(BaseModel):
    userId: int

@router.post("/user", response_model=list[MessageResponse])
async def get_user_messages(
    request: UserMessagesRequest, 
    db: AsyncSession = Depends(get_db)
):
    try:
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
            .where(Message.userId == request.userId)  # Filtr dla konkretnego użytkownika
            .order_by(Message.date.desc())           # Sortowanie według daty malejąco
        )
        result = await db.execute(query)
        messages = result.fetchall()

        # Formatowanie danych w odpowiedniej strukturze
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





