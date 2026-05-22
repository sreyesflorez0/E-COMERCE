from fastapi import APIRouter, Depends, Request
from typing import List
from app.schemas import SearchRequest, RecommendationResponse, Recommendation
from app.auth import get_current_user
from app.product_client import get_active_products
from app.cart_client import get_user_cart
from app.ai_client import generate_recommendations, generate_cart_recommendations

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "UP", "service": "ai-recommendation-service"}

@router.get("/recommendations/trending", response_model=RecommendationResponse)
async def get_trending_recommendations():
    """
    Public endpoint. Does not use AI.
    Fetches active products and returns up to 5 as trending.
    """
    products = await get_active_products()
    
    recommendations = []
    # Just take first 5 for trending
    for p in products[:5]:
        recommendations.append(
            Recommendation(
                product_id=p.id,
                name=p.name,
                price=p.price,
                stock=p.stock,
                reason="Producto popular"
            )
        )
        
    return RecommendationResponse(recommendations=recommendations)

@router.post("/recommendations/search", response_model=RecommendationResponse)
async def search_recommendations(request: SearchRequest, user: dict = Depends(get_current_user)):
    """
    Protected endpoint. Uses Gemini to match user query with products.
    """
    products = await get_active_products()
    
    # Cap max results globally to prevent excessive payloads
    max_res = min(request.max_results, 5)
    
    if not products:
        return RecommendationResponse(query=request.query, recommendations=[])
        
    recommendations = await generate_recommendations(request.query, max_res, products)
    
    return RecommendationResponse(query=request.query, recommendations=recommendations)

@router.get("/recommendations/cart", response_model=RecommendationResponse)
async def cart_recommendations(req: Request, user: dict = Depends(get_current_user)):
    """
    Protected endpoint. Uses Gemini to recommend complements based on cart.
    """
    # Extract token for cart service call
    token = None
    auth_header = req.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif "accessToken" in req.cookies:
        token = req.cookies.get("accessToken")
        
    products = await get_active_products()
    if not products:
        return RecommendationResponse(recommendations=[])
        
    cart = await get_user_cart(user["user_id"], token)
    
    max_res = 5
    
    if not cart or not cart.items:
        # Cart is empty, fallback to simple trending
        recs = []
        for p in products[:max_res]:
            recs.append(
                Recommendation(
                    product_id=p.id,
                    name=p.name,
                    price=p.price,
                    stock=p.stock,
                    reason="Recomendación general"
                )
            )
        return RecommendationResponse(recommendations=recs)
        
    # Cart has items, ask Gemini for complements
    cart_items_list = [{"productId": item.productId, "quantity": item.quantity} for item in cart.items]
    recommendations = await generate_cart_recommendations(cart_items_list, max_res, products)
    
    return RecommendationResponse(recommendations=recommendations)
