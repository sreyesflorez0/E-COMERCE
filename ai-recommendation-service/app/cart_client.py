import httpx
import logging
from typing import Optional
from app.config import settings
from app.schemas import Cart

logger = logging.getLogger("ai_recommendation.cart_client")

async def get_user_cart(user_id: str, token: str) -> Optional[Cart]:
    # Pass the token along to authenticate against the cart service
    url = f"{settings.CART_SERVICE_URL}/api/cart"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=5.0)
            
            if response.status_code == 404:
                return None
                
            response.raise_for_status()
            
            data = response.json()
            return Cart(**data)
    except Exception as e:
        logger.error(f"Failed to fetch cart for user {user_id}: {str(e)}")
        return None
