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
        "https://localhost:3000", "https://127.0.0.1:3000",  
        "https://localhost:3001", "https://127.0.0.1:3001",  
        "https://localhost:3002", "https://127.0.0.1:3002",
        "https://localhost:3003", "https://127.0.0.1:3003",
        "https://localhost:3004", "https://127.0.0.1:3004",
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
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(login.router, prefix="/login", tags=["Login"])  # Dedicated login router
app.include_router(messages.router, prefix="/messages", tags=["Messages"])
