from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter()

# Load API keys from environment variables
STOCK_API_KEY = os.getenv("STOCK_API_KEY")
CRYPTO_API_KEY = os.getenv("CRYPTO_API_KEY")

# Get stock price (Example: Alpha Vantage API)
@router.get("/api/stock/{symbol}")
def get_stock_price(symbol: str):
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={STOCK_API_KEY}"
        response = requests.get(url).json()
        if "Global Quote" in response:
            return {"symbol": symbol, "price": response["Global Quote"]["05. price"]}
        else:
            raise HTTPException(status_code=400, detail="Invalid Stock Symbol")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock price: {str(e)}")

# Get crypto price (Example: CoinGecko API)
@router.get("/api/crypto/{symbol}")
def get_crypto_price(symbol: str):
    try:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd"
        response = requests.get(url).json()
        if symbol in response:
            return {"symbol": symbol, "price": response[symbol]["usd"]}
        else:
            raise HTTPException(status_code=400, detail="Invalid Crypto Symbol")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crypto price: {str(e)}")
