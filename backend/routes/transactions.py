from fastapi import APIRouter, HTTPException
from database import db
from utils import validate_transaction, format_currency

router = APIRouter()

@router.post("/api/transactions")
async def add_transaction(transaction: dict):
    """Adds a new transaction after validation"""
    error = validate_transaction(transaction)
    if error:
        raise HTTPException(status_code=400, detail=error)
    transaction["amount"] = format_currency(transaction["amount"])
    db.transactions.insert_one(transaction)
    return {"message": "Transaction added successfully"}
