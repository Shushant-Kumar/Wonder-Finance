import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is not set in the environment variables.")

try:
    client = AsyncIOMotorClient(MONGO_URI)
    database = client["wonder_finance"]
    users_collection = database["users"]
    transactions_collection = database["transactions"]
except Exception as e:
    raise ConnectionError(f"Failed to connect to MongoDB: {str(e)}")