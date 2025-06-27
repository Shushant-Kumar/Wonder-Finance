from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    INVESTMENT = "investment"
    TRANSFER = "transfer"

class User(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfile(BaseModel):
    user_email: EmailStr
    monthly_income: Optional[float] = None
    risk_tolerance: Optional[int] = Field(None, ge=1, le=10, description="Risk tolerance on a scale of 1-10")
    investment_goals: Optional[List[str]] = None
    preferred_categories: Optional[List[str]] = None

class Transaction(BaseModel):
    user_email: EmailStr
    amount: float = Field(gt=0, description="Transaction amount must be positive")
    category: str
    description: Optional[str] = None
    transaction_type: TransactionType
    date: datetime = Field(default_factory=datetime.utcnow)
    tags: Optional[List[str]] = None

class Budget(BaseModel):
    user_email: EmailStr
    category: str
    amount: float = Field(gt=0)
    period: str = "monthly"  # monthly, weekly, yearly
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None

class FinancialGoal(BaseModel):
    user_email: EmailStr
    name: str
    target_amount: float = Field(gt=0)
    current_amount: float = Field(default=0)
    deadline: Optional[datetime] = None
    category: str
    priority: int = Field(ge=1, le=5)

class InvestmentAsset(BaseModel):
    user_email: EmailStr
    symbol: str
    asset_type: str  # stock, crypto, etf, etc.
    quantity: float = Field(gt=0)
    purchase_price: float = Field(gt=0)
    purchase_date: datetime = Field(default_factory=datetime.utcnow)