import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException
import os
from dotenv import load_dotenv

# Załaduj zmienne środowiskowe z pliku .env
load_dotenv()

# Pobierz sekretny klucz do JWT z pliku .env
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
if not SECRET_KEY or SECRET_KEY == "default_secret_key":
    raise ValueError("SECRET_KEY is not properly set in .env file.")



ALGORITHM = "HS256"

###Tworzy tymczasowy JWT token z krótkim czasem ważności.
def create_temporary_token(data: dict, expires_delta: timedelta = timedelta(minutes=5)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

###Weryfikuje poprawność tokenu JWT.
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
