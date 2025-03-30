import datetime
import os
import openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "text-davinci-003")  # Default to "text-davinci-003"

def format_currency(amount: float) -> str:
    """Formats a number as currency (INR)"""
    return f"₹{amount:,.2f}"

def get_current_timestamp() -> str:
    """Returns the current timestamp in a readable format"""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def generate_ai_suggestion():
    """Fetches an AI-powered financial suggestion using OpenAI API"""
    try:
        response = openai.Completion.create(
            model=OPENAI_MODEL,
            prompt="Give me a smart money-saving tip.",
            max_tokens=50
        )
        return response["choices"][0]["text"].strip()
    except Exception as e:
        return f"AI Suggestion Error: {str(e)}"

def validate_transaction(data):
    """Validates transaction data before inserting into the database"""
    required_fields = ["amount", "category", "date"]
    for field in required_fields:
        if field not in data:
            return f"Missing field: {field}"
    return None