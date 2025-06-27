from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
import requests
import os
from database import transactions_collection
from utils import verify_token
import pandas as pd
from datetime import datetime, timedelta
import logging

router = APIRouter()

# Load API keys from environment variables
STOCK_API_KEY = os.getenv("STOCK_API_KEY")
CRYPTO_API_KEY = os.getenv("CRYPTO_API_KEY")
FINANCIAL_MODELING_API_KEY = os.getenv("FINANCIAL_MODELING_API_KEY")

if not STOCK_API_KEY or not CRYPTO_API_KEY:
    logging.warning("API keys for stock or crypto are not configured. Some features may not work properly.")

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = await verify_token(token)
    return payload["email"]

@router.get("/stock/{symbol}")
def get_stock_price(symbol: str):
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={STOCK_API_KEY}"
        response = requests.get(url).json()
        if "Global Quote" in response and response["Global Quote"]:
            data = response["Global Quote"]
            return {
                "symbol": symbol, 
                "price": float(data["05. price"]),
                "change_percent": data["10. change percent"],
                "high": data["03. high"],
                "low": data["04. low"],
                "volume": data["06. volume"]
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid Stock Symbol or API limit reached")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock price: {str(e)}")

@router.get("/crypto/{symbol}")
def get_crypto_price(symbol: str):
    try:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd,inr&include_24hr_change=true"
        response = requests.get(url).json()
        if symbol in response:
            data = response[symbol]
            return {
                "symbol": symbol, 
                "price_usd": data["usd"],
                "price_inr": data["inr"],
                "change_24h_percent": data.get("usd_24h_change", 0)
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid Crypto Symbol")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crypto price: {str(e)}")

@router.get("/portfolio")
async def get_portfolio_overview(user_email: str = Depends(get_current_user)):
    """Get overview of user's investment portfolio"""
    # Fetch all investment transactions
    cursor = transactions_collection.find({
        "user_email": user_email,
        "transaction_type": "investment"
    })
    investments = await cursor.to_list(length=1000)
    
    # Group by asset
    portfolio = {}
    for inv in investments:
        symbol = inv.get("symbol")
        if symbol not in portfolio:
            portfolio[symbol] = {
                "symbol": symbol,
                "asset_type": inv.get("asset_type", "stock"),
                "total_quantity": 0,
                "total_invested": 0
            }
        
        portfolio[symbol]["total_quantity"] += inv.get("quantity", 0)
        portfolio[symbol]["total_invested"] += inv.get("amount", 0)
    
    # Get current prices for each asset
    portfolio_list = list(portfolio.values())
    for asset in portfolio_list:
        try:
            if asset["asset_type"] == "stock":
                price_data = get_stock_price(asset["symbol"])
                asset["current_price"] = price_data["price"]
            elif asset["asset_type"] == "crypto":
                price_data = get_crypto_price(asset["symbol"])
                asset["current_price"] = price_data["price_usd"]
                
            # Calculate current value and profit/loss
            asset["current_value"] = asset["current_price"] * asset["total_quantity"]
            asset["profit_loss"] = asset["current_value"] - asset["total_invested"]
            asset["profit_loss_percent"] = (asset["profit_loss"] / asset["total_invested"]) * 100 if asset["total_invested"] > 0 else 0
        except Exception as e:
            asset["error"] = f"Unable to fetch current price: {str(e)}"
    
    return {"portfolio": portfolio_list}

@router.get("/trending")
def get_trending_assets():
    """Get trending stocks and cryptocurrencies"""
    try:
        # Get trending stocks
        stocks_url = f"https://financialmodelingprep.com/api/v3/stock/gainers?apikey={FINANCIAL_MODELING_API_KEY}"
        stocks_response = requests.get(stocks_url).json()
        trending_stocks = stocks_response.get("mostGainerStock", [])[:5]
        
        # Get trending cryptos
        crypto_url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false"
        crypto_response = requests.get(crypto_url).json()
        
        return {
            "trending_stocks": trending_stocks,
            "trending_crypto": crypto_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending assets: {str(e)}")

@router.get("/recommendations")
async def get_investment_recommendations(user_email: str = Depends(get_current_user)):
    """Get personalized investment recommendations based on user's profile"""
    # Get user profile for risk tolerance
    user = await users_collection.find_one({"email": user_email})
    risk_tolerance = user.get("risk_tolerance", 5)  # Default to medium risk
    
    recommendations = {
        "message": f"Based on your risk profile (level {risk_tolerance}/10), here are some recommendations:",
        "suggestions": []
    }
    
    # Add recommendations based on risk tolerance
    if risk_tolerance <= 3:  # Low risk
        recommendations["suggestions"].extend([
            {"type": "ETF", "symbol": "VOO", "name": "Vanguard S&P 500 ETF", "reason": "Low-cost index fund tracking S&P 500"},
            {"type": "Stock", "symbol": "MSFT", "name": "Microsoft", "reason": "Stable blue-chip company with consistent growth"},
        ])
    elif risk_tolerance <= 7:  # Medium risk
        recommendations["suggestions"].extend([
            {"type": "Stock", "symbol": "AAPL", "name": "Apple", "reason": "Strong market position with growth potential"},
            {"type": "Crypto", "symbol": "BTC", "name": "Bitcoin", "reason": "Leading cryptocurrency with increasing institutional adoption"},
        ])
    else:  # High risk
        recommendations["suggestions"].extend([
            {"type": "Stock", "symbol": "TSLA", "name": "Tesla", "reason": "High growth potential in electric vehicle market"},
            {"type": "Crypto", "symbol": "ETH", "name": "Ethereum", "reason": "Smart contract platform with significant growth potential"},
        ])
    
    return recommendations
