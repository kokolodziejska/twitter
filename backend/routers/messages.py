from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Message
from db import get_db
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()  # Router dla wiadomości

# Model danych dla wiadomości
class CreateMessageRequest(BaseModel):
    userId: int
    userName: str
    message: str
    image: str | None = None  # Obraz jest opcjonalny

class MessageResponse(BaseModel):
    userId: int
    userName: str
    message: str
    image: str | None 
    date: datetime

# Endpoint do tworzenia nowej wiadomości
@router.post("/add", response_model=MessageResponse)
async def create_message(
    request: CreateMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Ustawianie wartości domyślnych
        new_message = Message(
            userId=request.userId,
            userName=request.userName,
            message=request.message,
            image=request.image if request.image else None,  # Obraz jest opcjonalny
            date=datetime.utcnow()  # Ustawiamy aktualną datę i czas
        )
        db.add(new_message)
        await db.commit()
        await db.refresh(new_message)  # Pobieramy ID i inne dane z bazy

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
                Message.userName
                
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
            }
            for msg in messages
        ]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")





