import httpx
import logging
from typing import List
from app.config import settings
from app.schemas import Product

logger = logging.getLogger("ai_recommendation.product_client")

async def get_active_products() -> List[Product]:
    url = f"{settings.PRODUCT_SERVICE_URL}/products"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            if response.status_code != 200:
                logger.warning(f"Failed to fetch from {url}, status code {response.status_code}. Trying /api/products.")
                url = f"{settings.PRODUCT_SERVICE_URL}/api/products"
                response = await client.get(url, timeout=5.0)
                
            response.raise_for_status()
            
            data = response.json()
            products_data = data if isinstance(data, list) else data.get("content", [])
            
            logger.info(f"[LOG_SEGURO] Cantidad de productos recibidos desde product-service: {len(products_data)}")
            
            products = []
            for item in products_data:
                try:
                    product = Product(**item)
                    if product.isActive and product.stock > 0:
                        products.append(product)
                except Exception as e:
                    logger.warning(f"Failed to parse product {item.get('id')}: {e}")
            
            logger.info(f"[LOG_SEGURO] Cantidad de productos válidos luego del filtro: {len(products)}")
            return products
    except Exception as e:
        logger.error(f"Failed to fetch products from product-service: {str(e)}")
        return []
