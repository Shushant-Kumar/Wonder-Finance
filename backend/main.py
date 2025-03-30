from fastapi import FastAPI, Depends, HTTPException
from routes.users import router as user_router
from routes.transactions import router as transaction_router
from routes.ai import router as ai_router
from routes.market import router as market_router  # Add this import
import uvicorn

app = FastAPI(title="Wonder Finance API")

# Include Routes
app.include_router(user_router, prefix="/users")
app.include_router(transaction_router, prefix="/transactions")
app.include_router(ai_router, prefix="/ai")
app.include_router(market_router, prefix="/market")  # Add this line

@app.get("/")
def home():
    return {"message": "Welcome to Wonder Finance"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)