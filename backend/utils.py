import datetime
import os
import openai
import logging
import jwt
import requests
from typing import Dict, List, Optional, Union
from dotenv import load_dotenv
from fastapi import Request, HTTPException

logging.basicConfig(level=logging.INFO)

load_dotenv()

# Configure OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")

def format_currency(amount: float, currency: str = "INR") -> str:
    """Formats a number as currency"""
    try:
        if currency == "INR":
            return f"₹{amount:,.2f}"
        elif currency == "USD":
            return f"${amount:,.2f}"
        else:
            return f"{amount:,.2f} {currency}"
    except Exception as e:
        logging.error(f"Error formatting currency: {e}")
        return "Invalid amount"

def get_current_timestamp() -> str:
    """Returns the current timestamp in a readable format"""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

async def generate_ai_suggestion(user_data: Optional[Dict] = None):
    """Fetches an AI-powered financial suggestion using OpenAI API"""
    try:
        base_prompt = "You are a financial advisor. "
        
        if user_data:
            # Personalized advice based on user data
            prompt = (
                f"{base_prompt} The user has a monthly income of {user_data.get('monthly_income', 'unknown')}, "
                f"with {user_data.get('transaction_count', 0)} transactions in the last month. "
                f"Their top spending category is {user_data.get('top_category', 'unknown')}. "
                f"Provide a personalized financial tip."
            )
        else:
            prompt = f"{base_prompt} Provide a general smart money-saving tip."
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Updated to use chat model
            messages=[
                {"role": "system", "content": "You are a financial advisor providing concise advice."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"AI Suggestion Error: {e}")
        return f"Unable to generate AI advice at the moment."

def validate_transaction(data):
    """Validates transaction data before inserting into the database"""
    required_fields = ["amount", "category", "transaction_type", "user_email"]
    for field in required_fields:
        if field not in data:
            return f"Missing field: {field}"
            
    if data.get("amount", 0) <= 0:
        return "Transaction amount must be positive"
        
    return None

async def verify_token(token: str) -> Dict:
    """Verifies a JWT token and returns the payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_budget_status(budget: Dict, transactions: List[Dict]) -> Dict:
    """Calculate budget status based on transactions"""
    total_spent = sum(t["amount"] for t in transactions if t["category"] == budget["category"])
    remaining = budget["amount"] - total_spent
    percentage_used = (total_spent / budget["amount"]) * 100 if budget["amount"] > 0 else 0
    
    return {
        "total_budget": budget["amount"],
        "spent": total_spent,
        "remaining": remaining,
        "percentage_used": percentage_used,
        "status": "over_budget" if remaining < 0 else "on_track"
    }

async def get_financial_news():
    """Fetch latest financial news"""
    NEWS_API_KEY = os.getenv("NEWS_API_KEY")
    try:
        url = f"https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey={NEWS_API_KEY}"
        response = requests.get(url)
        data = response.json()
        return data.get("articles", [])[:5]  # Return top 5 news articles
    except Exception as e:
        logging.error(f"Error fetching financial news: {e}")
        return []

def analyze_spending_trends(transactions: List[Dict]) -> Dict:
    """Analyze spending trends from transaction data"""
    if not transactions:
        return {"message": "No transaction data available"}
    
    categories = {}
    monthly_spending = {}
    
    for tx in transactions:
        # Category analysis
        category = tx.get("category")
        if category in categories:
            categories[category] += tx.get("amount", 0)
        else:
            categories[category] = tx.get("amount", 0)
        
        # Monthly analysis
        month = tx.get("date").strftime("%Y-%m") if isinstance(tx.get("date"), datetime.datetime) else "unknown"
        if month in monthly_spending:
            monthly_spending[month] += tx.get("amount", 0)
        else:
            monthly_spending[month] = tx.get("amount", 0)
    
    top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
    
    return {
        "top_spending_categories": top_categories,
        "monthly_spending": monthly_spending,
        "total_transactions": len(transactions)
    }