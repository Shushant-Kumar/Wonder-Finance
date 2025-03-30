from fastapi import APIRouter, HTTPException
from database import users_collection
from models import User
import bcrypt
import jwt
import os
from pydantic import EmailStr

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY")

@router.post("/register")
async def register(user: User):
    if not EmailStr.validate(user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())
    user_data = {"email": user.email, "password": hashed_pw}
    await users_collection.insert_one(user_data)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: User):
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not bcrypt.checkpw(user.password.encode(), existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = jwt.encode({"email": user.email}, SECRET_KEY, algorithm="HS256")
    return {"token": token}