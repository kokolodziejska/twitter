from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    userId = Column(Integer, primary_key=True, index=True)
    userName = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    devices = Column(JSON, nullable=True)
    ip = Column(JSON, nullable=True)
    failedAttempts = Column(Integer, default=0)
    last = Column(DateTime, nullable=True)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, nullable=False)
    userName = Column(String, unique=True, nullable=False)
    message = Column(Text, nullable=False)
    image = Column(Text, nullable=True)  # Jeśli dodasz obrazy jako ścieżki plików
    date = Column(DateTime, nullable=False)

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, nullable=False)
    action = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)
