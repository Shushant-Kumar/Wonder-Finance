from pydantic import BaseModel, Field
from datetime import datetime

class User(BaseModel):
    email: str
    password: str

class Transaction(BaseModel):
    user_email: str
    amount: float = Field(gt=0, description="Transaction amount must be positive")
    category: str
    date: datetime = datetime.utcnow()