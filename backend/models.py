from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
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
    privKey = Column(Text, nullable=True)  
    pubKey = Column(Text, nullable=True)
    profilePicture = Column(Text, nullable=True)
    totpSecret = Column(String, nullable=True)
    isTotpEnabled = Column(Boolean, default=False)  # Czy TOTP jest włączone
    tempSessionId = Column(Text,  nullable=True) 
    mailCode = Column(Integer, nullable=True) 

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, nullable=False)
    userName = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    image = Column(Text, nullable=True)  
    date = Column(DateTime, nullable=False)
    signature = Column (Text, nullable=True)

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, nullable=False)
    action = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)
