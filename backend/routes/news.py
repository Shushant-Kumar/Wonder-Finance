from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import Optional, List
from utils import verify_token
import requests
import os
from datetime import datetime, timedelta
import logging

router = APIRouter()

# Load API keys from environment variables
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

if not NEWS_API_KEY:
    logging.warning("NEWS_API_KEY is not configured. News features may not work properly.")

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = await verify_token(token)
    return payload["email"]

@router.get("/latest")
async def get_latest_financial_news(
    category: Optional[str] = Query(None, description="News category: business, finance, economy, markets"),
    count: int = Query(5, ge=1, le=20, description="Number of news items to return"),
    user_email: str = Depends(get_current_user)
):
    """Get latest financial news"""
    try:
        # Build query parameters
        params = {
            "apiKey": NEWS_API_KEY,
            "language": "en",
            "pageSize": count,
            "category": "business"
        }
        
        # Add query if category is specified
        if category:
            params["q"] = category
        
        # Make API request
        url = "https://newsapi.org/v2/top-headlines"
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, 
                                detail=f"News API error: {response.json().get('message', 'Unknown error')}")
        
        data = response.json()
        articles = data.get("articles", [])
        
        # Format the response
        formatted_news = []
        for article in articles:
            formatted_news.append({
                "title": article.get("title"),
                "description": article.get("description"),
                "source": article.get("source", {}).get("name"),
                "url": article.get("url"),
                "image_url": article.get("urlToImage"),
                "published_at": article.get("publishedAt")
            })
        
        return {"news": formatted_news}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching financial news: {str(e)}")

@router.get("/market-updates")
async def get_market_updates(user_email: str = Depends(get_current_user)):
    """Get latest market indices updates"""
    try:
        # Major market indices to track
        indices = ["^GSPC", "^DJI", "^IXIC", "^NSEI", "^BSESN"]  # S&P 500, Dow Jones, NASDAQ, Nifty 50, Sensex
        
        indices_data = []
        for index in indices:
            try:
                # Use Alpha Vantage to get index data
                STOCK_API_KEY = os.getenv("STOCK_API_KEY")
                url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={index}&apikey={STOCK_API_KEY}"
                response = requests.get(url).json()
                
                if "Global Quote" in response and response["Global Quote"]:
                    quote = response["Global Quote"]
                    indices_data.append({
                        "symbol": index,
                        "name": get_index_name(index),
                        "price": quote.get("05. price"),
                        "change": quote.get("09. change"),
                        "change_percent": quote.get("10. change percent"),
                        "last_updated": datetime.now().isoformat()
                    })
            except Exception as e:
                logging.error(f"Error fetching data for index {index}: {e}")
        
        return {"indices": indices_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market updates: {str(e)}")

@router.get("/economic-indicators")
async def get_economic_indicators():
    """Get latest economic indicators like inflation, interest rates, etc."""
    try:
        # This would typically use an economic data API
        # For demonstration, returning mock data
        indicators = [
            {
                "name": "US Inflation Rate",
                "value": "3.7%",
                "previous": "3.6%",
                "date": "2023-09-01"
            },
            {
                "name": "US Fed Interest Rate",
                "value": "5.5%",
                "previous": "5.25%",
                "date": "2023-08-15"
            },
            {
                "name": "India RBI Repo Rate",
                "value": "6.5%",
                "previous": "6.5%",
                "date": "2023-09-10"
            },
            {
                "name": "US Unemployment Rate",
                "value": "3.8%",
                "previous": "3.5%",
                "date": "2023-08-30"
            }
        ]
        
        return {"economic_indicators": indicators}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching economic indicators: {str(e)}")

def get_index_name(symbol):
    """Convert index symbol to readable name"""
    index_names = {
        "^GSPC": "S&P 500",
        "^DJI": "Dow Jones",
        "^IXIC": "NASDAQ",
        "^NSEI": "Nifty 50",
        "^BSESN": "Sensex"
    }
    return index_names.get(symbol, symbol)
