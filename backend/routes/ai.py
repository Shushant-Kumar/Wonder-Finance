from fastapi import APIRouter, HTTPException
from utils import generate_ai_suggestion
import openai

router = APIRouter()

@router.get("/api/ai/suggest")
def get_ai_suggestion():
    """Fetch AI-generated financial suggestions"""
    return {"suggestion": generate_ai_suggestion()}

@router.get("/suggest")
async def get_financial_suggestion():
    try:
        prompt = "Give me a money-saving tip."
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": prompt}]
        )
        return {"suggestion": response["choices"][0]["message"]["content"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating suggestion: {str(e)}")
