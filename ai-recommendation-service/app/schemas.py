from pydantic import BaseModel, model_validator
from typing import List, Optional, Any

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

    @model_validator(mode='before')
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalizar id
            if 'product_id' in data and 'id' not in data:
                data['id'] = data['product_id']
            # Normalizar categoryId
            if 'category_id' in data and 'categoryId' not in data:
                data['categoryId'] = data['category_id']
            # Normalizar price
            if 'price' in data:
                try:
                    data['price'] = float(data['price'])
                except (ValueError, TypeError):
                    data['price'] = 0.0
            # Normalizar active
            if 'active' in data:
                data['isActive'] = bool(data['active'])
            elif 'isActive' not in data:
                data['isActive'] = True
            # Normalizar stock
            if 'stock' in data:
                try:
                    data['stock'] = int(data['stock'])
                except (ValueError, TypeError):
                    data['stock'] = 0
        return data

class CartItem(BaseModel):
    productId: str
    quantity: int
    price: float

class Cart(BaseModel):
    id: str
    userId: str
    items: List[CartItem]
