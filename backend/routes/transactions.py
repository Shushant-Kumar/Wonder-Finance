from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from database import transactions_collection, users_collection  # Fixed database import
from models import Transaction, Budget
from utils import validate_transaction, verify_token, analyze_spending_trends
from datetime import datetime, timedelta

router = APIRouter()

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = await verify_token(token)
    return payload["email"]

@router.post("/")
async def add_transaction(transaction: Transaction, user_email: str = Depends(get_current_user)):
    """Adds a new transaction after validation"""
    transaction_dict = transaction.dict()
    transaction_dict["user_email"] = user_email
    
    error = validate_transaction(transaction_dict)
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    await transactions_collection.insert_one(transaction_dict)
    return {"message": "Transaction added successfully", "transaction_id": str(transaction_dict["_id"])}

@router.get("/")
async def get_transactions(
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 50,
    user_email: str = Depends(get_current_user)
):
    """Get transactions with optional filters"""
    query = {"user_email": user_email}
    
    if category:
        query["category"] = category
    
    date_query = {}
    if start_date:
        date_query["$gte"] = datetime.fromisoformat(start_date)
    if end_date:
        date_query["$lte"] = datetime.fromisoformat(end_date)
    
    if date_query:
        query["date"] = date_query
    
    cursor = transactions_collection.find(query).sort("date", -1).limit(limit)
    transactions = await cursor.to_list(length=limit)
    
    return {"transactions": transactions}

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str, user_email: str = Depends(get_current_user)):
    """Delete a transaction by ID"""
    from bson.objectid import ObjectId
    
    result = await transactions_collection.delete_one({"_id": ObjectId(transaction_id), "user_email": user_email})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {"message": "Transaction deleted successfully"}

@router.get("/analysis")
async def get_spending_analysis(
    period: Optional[str] = "month",
    user_email: str = Depends(get_current_user)
):
    """Get spending analysis for the user"""
    # Calculate date range based on period
    today = datetime.now()
    if period == "week":
        start_date = today - timedelta(days=7)
    elif period == "month":
        start_date = today - timedelta(days=30)
    elif period == "year":
        start_date = today - timedelta(days=365)
    else:
        start_date = today - timedelta(days=30)  # Default to month

    # Get transactions for the period
    cursor = transactions_collection.find({
        "user_email": user_email,
        "date": {"$gte": start_date}
    })
    transactions = await cursor.to_list(length=1000)
    
    analysis = analyze_spending_trends(transactions)
    return analysis
