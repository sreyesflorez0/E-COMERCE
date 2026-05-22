from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    max_results: int = 5

class Recommendation(BaseModel):
    product_id: str
    name: str
    price: float
    stock: int
    reason: str

class RecommendationResponse(BaseModel):
    query: Optional[str] = None
    recommendations: List[Recommendation]

class Product(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    isActive: bool = True
    categoryId: Optional[str] = None

class CartItem(BaseModel):
    productId: str
    quantity: int
    price: float

class Cart(BaseModel):
    id: str
    userId: str
    items: List[CartItem]
