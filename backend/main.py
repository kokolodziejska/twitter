from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, messages, login  # Import the `login` router

app = FastAPI()

from db import init_db

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://localhost", "https://127.0.0.1",  
   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/")
def read_root():
    return {"message": "Hello, backend!"}

# Register routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(login.router, prefix="/api/login", tags=["Login"])  # Dedicated login router
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
