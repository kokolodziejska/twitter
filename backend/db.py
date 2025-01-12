import os
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.orm import declarative_base

# Twoje modele
from models import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:foka@localhost:5432/twitter")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(bind=engine, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        # Utworzenie tabel na podstawie modeli
        await conn.run_sync(Base.metadata.create_all)

# Funkcja get_db do zwracania sesji
async def get_db():
    async with async_session() as session:
        yield session
