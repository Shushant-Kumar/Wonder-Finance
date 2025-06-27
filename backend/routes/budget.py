from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from database import users_collection, transactions_collection
from models import Budget
from utils import verify_token, calculate_budget_status
from datetime import datetime

router = APIRouter()

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = await verify_token(token)
    return payload["email"]

@router.post("/")
async def create_budget(budget: Budget, user_email: str = Depends(get_current_user)):
    """Create a new budget for a category"""
    if budget.user_email != user_email:
        raise HTTPException(status_code=403, detail="Not authorized to create budget for another user")
    
    # Check if budget for this category already exists
    existing_budget = await users_collection.find_one({
        "email": user_email,
        "budgets.category": budget.category
    })
    
    if existing_budget:
        raise HTTPException(status_code=400, detail=f"Budget for category '{budget.category}' already exists")
    
    # Add budget to user document
    budget_dict = budget.dict()
    result = await users_collection.update_one(
        {"email": user_email},
        {"$push": {"budgets": budget_dict}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"Budget for {budget.category} created successfully"}

@router.get("/")
async def get_budgets(user_email: str = Depends(get_current_user)):
    """Get all budgets for a user with status"""
    user = await users_collection.find_one({"email": user_email})
    
    if not user or "budgets" not in user:
        return {"budgets": []}
    
    budgets = user.get("budgets", [])
    
    # Get current date for budget period calculation
    current_date = datetime.now()
    
    # Get all transactions for this month to calculate budget status
    month_start = datetime(current_date.year, current_date.month, 1)
    
    cursor = transactions_collection.find({
        "user_email": user_email,
        "date": {"$gte": month_start, "$lte": current_date},
        "transaction_type": "expense"
    })
    
    transactions = await cursor.to_list(length=1000)
    
    # Calculate status for each budget
    budget_statuses = []
    for budget in budgets:
        status = calculate_budget_status(budget, transactions)
        budget_statuses.append({
            **budget,
            **status
        })
    
    return {"budgets": budget_statuses}

@router.put("/{category}")
async def update_budget(
    category: str, 
    budget_update: dict,
    user_email: str = Depends(get_current_user)
):
    """Update an existing budget"""
    # Remove fields that shouldn't be updated
    if "user_email" in budget_update:
        del budget_update["user_email"]
    
    result = await users_collection.update_one(
        {
            "email": user_email,
            "budgets.category": category
        },
        {"$set": {f"budgets.$.{key}": value for key, value in budget_update.items()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Budget for category '{category}' not found")
    
    return {"message": f"Budget for {category} updated successfully"}

@router.delete("/{category}")
async def delete_budget(category: str, user_email: str = Depends(get_current_user)):
    """Delete a budget"""
    result = await users_collection.update_one(
        {"email": user_email},
        {"$pull": {"budgets": {"category": category}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"Budget for category '{category}' not found")
    
    return {"message": f"Budget for {category} deleted successfully"}

@router.get("/analysis")
async def get_budget_analysis(user_email: str = Depends(get_current_user)):
    """Get an analysis of budget performance"""
    # Get user budgets
    user = await users_collection.find_one({"email": user_email})
    if not user or "budgets" not in user:
        raise HTTPException(status_code=404, detail="No budgets found")
    
    budgets = user.get("budgets", [])
    
    # Get transactions from the last 3 months
    current_date = datetime.now()
    three_months_ago = datetime(current_date.year, current_date.month - 3, 1) if current_date.month > 3 else \
                       datetime(current_date.year - 1, current_date.month + 9, 1)
    
    cursor = transactions_collection.find({
        "user_email": user_email,
        "date": {"$gte": three_months_ago, "$lte": current_date},
        "transaction_type": "expense"
    })
    
    transactions = await cursor.to_list(length=1000)
    
    # Group transactions by month and category
    monthly_spending = {}
    for tx in transactions:
        tx_date = tx.get("date")
        month_key = f"{tx_date.year}-{tx_date.month:02d}"
        category = tx.get("category", "Other")
        
        if month_key not in monthly_spending:
            monthly_spending[month_key] = {}
        
        if category not in monthly_spending[month_key]:
            monthly_spending[month_key][category] = 0
        
        monthly_spending[month_key][category] += tx.get("amount", 0)
    
    # Compare budgets with actual spending
    budget_analysis = []
    for budget in budgets:
        category = budget.get("category")
        budget_amount = budget.get("amount", 0)
        
        category_analysis = {
            "category": category,
            "budget_amount": budget_amount,
            "monthly_spending": []
        }
        
        # Compare with each month's spending
        for month, categories in monthly_spending.items():
            spent = categories.get(category, 0)
            category_analysis["monthly_spending"].append({
                "month": month,
                "spent": spent,
                "difference": budget_amount - spent,
                "percent_used": (spent / budget_amount * 100) if budget_amount > 0 else 0
            })
        
        budget_analysis.append(category_analysis)
    
    return {"budget_analysis": budget_analysis}
