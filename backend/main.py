from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes.users import router as user_router
from routes.transactions import router as transaction_router
from routes.ai import router as ai_router
from routes.market import router as market_router
from routes.news import router as news_router
from routes.budget import router as budget_router  # Import the new budget router
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Wonder Finance API",
    description="Advanced financial management API with AI-powered insights",
    version="2.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # React default port
    "http://localhost:8080",  # Vue default port
    os.getenv("FRONTEND_URL", "http://localhost:3000")  # Get from env or use default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(transaction_router, prefix="/transactions", tags=["Transactions"])
app.include_router(ai_router, prefix="/ai", tags=["AI Insights"])
app.include_router(market_router, prefix="/market", tags=["Market Data"])
app.include_router(news_router, prefix="/news", tags=["Financial News"])
app.include_router(budget_router, prefix="/budgets", tags=["Budget Management"])  # Add the budget router

@app.get("/")
def home():
    return {
        "message": "Welcome to Wonder Finance API",
        "version": "2.0.0",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)