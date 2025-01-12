from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models import Message
from ..db import get_db

router = APIRouter()

@router.post("/")
async def create_message(userId: int, content: str, db: AsyncSession = Depends(get_db)):
    new_message = Message(userId=userId, content=content)
    db.add(new_message)
    await db.commit()
    return {"message": "Message created"}

@router.get("/{userId}")
async def get_messages(userId: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Message).where(Message.userId == userId))
    messages = result.scalars().all()
    return messages
