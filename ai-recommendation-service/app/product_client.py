import httpx
import logging
from typing import List
from app.config import settings
from app.schemas import Product

logger = logging.getLogger("ai_recommendation.product_client")

async def get_active_products() -> List[Product]:
    url = f"{settings.PRODUCT_SERVICE_URL}/api/products"
    try:
        async with httpx.AsyncClient() as client:
            # Setting timeout to 5 seconds
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            
            data = response.json()
            # If the response is paginated or wrapped, we might need to adjust.
            # Assuming it returns a list directly or has a 'content' / 'data' field.
            products_data = data if isinstance(data, list) else data.get("content", [])
            
            products = []
            for item in products_data:
                try:
                    product = Product(**item)
                    # Filter active products with stock > 0
                    if product.isActive and product.stock > 0:
                        products.append(product)
                except Exception as e:
                    logger.warning(f"Failed to parse product {item.get('id')}: {e}")
                    
            return products
    except Exception as e:
        logger.error(f"Failed to fetch products from product-service: {str(e)}")
        return []
