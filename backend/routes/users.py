from fastapi import APIRouter, HTTPException, Depends, Header
from database import users_collection
from models import User, UserProfile
from typing import Optional
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from utils import verify_token
from pydantic import EmailStr

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY")

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = await verify_token(token)
    return payload["email"]

@router.post("/register")
async def register(user: User):
    if not EmailStr.validate(user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())
    user_dict = user.dict()
    user_dict["password"] = hashed_pw
    user_dict["created_at"] = datetime.utcnow()
    
    await users_collection.insert_one(user_dict)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: User):
    existing_user = await users_collection.find_one({"email": user.email})
    if not existing_user or not bcrypt.checkpw(user.password.encode(), existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Create token with expiration
    token_data = {
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
    }
    
    token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
    return {"token": token, "email": user.email}

@router.get("/profile")
async def get_profile(user_email: str = Depends(get_current_user)):
    """Get user profile data"""
    profile = await users_collection.find_one(
        {"email": user_email},
        {"password": 0}  # Exclude password from results
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    return profile

@router.post("/profile")
async def update_profile(profile: UserProfile, user_email: str = Depends(get_current_user)):
    """Update user profile information"""
    if profile.user_email != user_email:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    profile_dict = profile.dict(exclude_unset=True)
    
    result = await users_collection.update_one(
        {"email": user_email},
        {"$set": profile_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or no changes made")
    
    return {"message": "Profile updated successfully"}

@router.post("/refresh-token")
async def refresh_token(user_email: str = Depends(get_current_user)):
    """Get a new token with extended expiration"""
    token_data = {
        "email": user_email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    
    token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
    return {"token": token}