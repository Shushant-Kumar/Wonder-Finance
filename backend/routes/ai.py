from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from database import transactions_collection, users_collection
from utils import generate_ai_suggestion, verify_token
import openai
from datetime import datetime, timedelta

router = APIRouter()

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = await verify_token(token)
    return payload["email"]

async def get_user_financial_context(user_email):
    """Get user's financial context for personalized advice"""
    # Get user profile
    user = await users_collection.find_one({"email": user_email})
    
    # Get recent transactions
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    cursor = transactions_collection.find({
        "user_email": user_email,
        "date": {"$gte": start_date, "$lte": end_date}
    })
    transactions = await cursor.to_list(length=1000)
    
    # Calculate financial context
    income = sum(tx["amount"] for tx in transactions if tx.get("transaction_type") == "income")
    expenses = sum(tx["amount"] for tx in transactions if tx.get("transaction_type") == "expense")
    
    # Get top spending categories
    categories = {}
    for tx in transactions:
        if tx.get("transaction_type") == "expense":
            category = tx.get("category", "Other")
            if category in categories:
                categories[category] += tx.get("amount", 0)
            else:
                categories[category] = tx.get("amount", 0)
    
    top_category = max(categories.items(), key=lambda x: x[1])[0] if categories else "Unknown"
    
    return {
        "monthly_income": income,
        "monthly_expenses": expenses,
        "transaction_count": len(transactions),
        "top_category": top_category,
        "risk_tolerance": user.get("risk_tolerance", 5)
    }

@router.get("/api/ai/suggest")
def get_ai_suggestion():
    """Fetch AI-generated financial suggestions"""
    return {"suggestion": generate_ai_suggestion()}

@router.get("/suggest")
async def get_financial_suggestion(user_email: str = Depends(get_current_user)):
    """Get personalized financial suggestions based on user data"""
    try:
        # Get user's financial context
        user_context = await get_user_financial_context(user_email)
        
        # Generate personalized suggestion
        suggestion = await generate_ai_suggestion(user_context)
        
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating suggestion: {str(e)}")

@router.post("/analyze-transaction")
async def analyze_transaction(transaction_data: dict, user_email: str = Depends(get_current_user)):
    """Analyze a potential transaction and provide AI-powered insights"""
    try:
        # Get user's financial context
        user_context = await get_user_financial_context(user_email)
        
        # Create a prompt for the transaction analysis
        prompt = f"""
        Analyze this potential {transaction_data.get('category')} transaction of {transaction_data.get('amount')} for financial impact.
        
        User Financial Context:
        - Monthly Income: {user_context['monthly_income']}
        - Monthly Expenses: {user_context['monthly_expenses']}
        - Top Spending Category: {user_context['top_category']}
        
        Provide a brief analysis of whether this transaction aligns with good financial practices.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial advisor providing concise transaction analysis."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )
        
        return {"analysis": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing transaction: {str(e)}")

@router.get("/budget-insights")
async def get_budget_insights(user_email: str = Depends(get_current_user)):
    """Get AI-powered insights on budgeting based on spending patterns"""
    try:
        # Get transactions from the last 90 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        
        cursor = transactions_collection.find({
            "user_email": user_email,
            "date": {"$gte": start_date, "$lte": end_date},
            "transaction_type": "expense"
        })
        transactions = await cursor.to_list(length=1000)
        
        # Categorize and sum transactions
        categories = {}
        for tx in transactions:
            category = tx.get("category", "Other")
            if category in categories:
                categories[category] += tx.get("amount", 0)
            else:
                categories[category] = tx.get("amount", 0)
        
        # Create a prompt for budget insights
        category_breakdown = "\n".join([f"- {cat}: {amt}" for cat, amt in categories.items()])
        prompt = f"""
        Analyze this user's spending in the last 90 days:
        
        {category_breakdown}
        
        Provide 3 specific, actionable budget improvement suggestions based on these spending patterns.
        Keep suggestions concise and focused on practical ways to optimize spending.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial advisor providing practical budgeting advice."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=250
        )
        
        return {"budget_insights": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating budget insights: {str(e)}")
