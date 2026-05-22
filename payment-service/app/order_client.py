import httpx
import logging
from uuid import UUID
from fastapi import Request
from app.config import settings
from app.auth import get_token_for_downstream

logger = logging.getLogger(__name__)

async def check_order_exists(order_id: UUID, request: Request) -> bool:
    token = get_token_for_downstream(request)
    if not token:
        logger.warning("No token found to validate order.")
        return False
        
    url = f"{settings.ORDER_SERVICE_URL}/orders/{order_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return True
            logger.warning(f"Order service returned {response.status_code} for order {order_id}")
            return False
    except Exception as e:
        logger.error(f"Error checking order {order_id}: {e}")
        return False
