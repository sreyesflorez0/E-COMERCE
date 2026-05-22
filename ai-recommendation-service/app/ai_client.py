import logging
import json
from typing import List, Dict
from google import genai
from google.genai import types
from app.config import settings
from app.schemas import Product, Recommendation

logger = logging.getLogger("ai_recommendation.ai_client")

# Initialize client using the new library
ai_client = None
if settings.GEMINI_API_KEY:
    try:
        ai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")

def _get_fallback_recommendations(products: List[Product], max_results: int) -> List[Recommendation]:
    logger.info("Using fallback recommendations")
    # Simple fallback: return the first active products
    fallback = []
    for p in products[:max_results]:
        fallback.append(
            Recommendation(
                product_id=p.id,
                name=p.name,
                price=p.price,
                stock=p.stock,
                reason="Recomendación general."
            )
        )
    return fallback

async def generate_recommendations(query: str, max_results: int, available_products: List[Product]) -> List[Recommendation]:
    # 1. Take up to 20 products to avoid huge payloads
    candidates = available_products[:20]
    
    if not ai_client or not candidates:
        return _get_fallback_recommendations(candidates, max_results)

    # 2. Build the payload safely
    product_catalog = [
        {"id": p.id, "name": p.name, "price": p.price, "stock": p.stock}
        for p in candidates
    ]

    prompt = f"""
    Eres un recomendador experto de productos.
    El usuario dice: "{query}"

    Aquí tienes nuestro catálogo de productos disponibles en JSON:
    {json.dumps(product_catalog, ensure_ascii=False)}

    REGLAS ESTRICTAS:
    1. Recomienda como máximo {max_results} productos.
    2. SOLO puedes recomendar productos que existan en el catálogo JSON de arriba. NO INVENTES NINGÚN PRODUCTO, PRECIO O STOCK.
    3. Si ningún producto coincide con la búsqueda, devuelve un array vacío [].
    4. Devuelve el resultado en formato JSON como un array de objetos con esta estructura:
       [{{ "product_id": "...", "reason": "Una razón corta (max 10 palabras)" }}]
    5. NO devuelvas markdown, solo el JSON puro.
    """

    try:
        logger.info("Calling Gemini API for search recommendations")
        response = ai_client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=500,
                response_mime_type="application/json"
            )
        )
        
        # Parse output
        raw_output = response.text
        # Remove any markdown code blocks if gemini returns them despite response_mime_type
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()

        parsed_json = json.loads(raw_output)
        
        # 3. Validate against original catalog
        valid_recommendations = []
        seen_ids = set()
        
        candidates_map = {p.id: p for p in candidates}
        
        for item in parsed_json:
            pid = item.get("product_id")
            if pid in candidates_map and pid not in seen_ids:
                seen_ids.add(pid)
                p = candidates_map[pid]
                valid_recommendations.append(
                    Recommendation(
                        product_id=p.id,
                        name=p.name,
                        price=p.price,
                        stock=p.stock,
                        reason=item.get("reason", "Buena opción")
                    )
                )
                
            if len(valid_recommendations) >= max_results:
                break
                
        return valid_recommendations

    except Exception as e:
        logger.error(f"Gemini API error during search: {e}")
        return _get_fallback_recommendations(candidates, max_results)

async def generate_cart_recommendations(cart_items: List[Dict], max_results: int, available_products: List[Product]) -> List[Recommendation]:
    # 1. Take up to 20 products
    candidates = available_products[:20]
    
    if not ai_client or not candidates:
        return _get_fallback_recommendations(candidates, max_results)

    product_catalog = [
        {"id": p.id, "name": p.name, "price": p.price, "stock": p.stock}
        for p in candidates
    ]
    
    cart_summary = [{"productId": item["productId"], "quantity": item["quantity"]} for item in cart_items]

    prompt = f"""
    Eres un recomendador experto de productos.
    El usuario tiene estos productos en su carrito:
    {json.dumps(cart_summary)}

    Aquí tienes nuestro catálogo de productos disponibles para recomendar (JSON):
    {json.dumps(product_catalog, ensure_ascii=False)}

    REGLAS ESTRICTAS:
    1. Recomienda como máximo {max_results} productos que sean complementarios al carrito.
    2. SOLO puedes recomendar productos que existan en el catálogo JSON. NO INVENTES PRODUCTOS.
    3. NO recomiendes productos que ya estén en el carrito si es posible.
    4. Devuelve el resultado en formato JSON como un array de objetos con esta estructura:
       [{{ "product_id": "...", "reason": "Una razón corta (max 10 palabras)" }}]
    5. NO devuelvas markdown, solo el JSON puro.
    """

    try:
        logger.info("Calling Gemini API for cart recommendations")
        response = ai_client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=500,
                response_mime_type="application/json"
            )
        )
        
        raw_output = response.text
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()

        parsed_json = json.loads(raw_output)
        
        valid_recommendations = []
        seen_ids = set()
        candidates_map = {p.id: p for p in candidates}
        
        for item in parsed_json:
            pid = item.get("product_id")
            if pid in candidates_map and pid not in seen_ids:
                seen_ids.add(pid)
                p = candidates_map[pid]
                valid_recommendations.append(
                    Recommendation(
                        product_id=p.id,
                        name=p.name,
                        price=p.price,
                        stock=p.stock,
                        reason=item.get("reason", "Complemento ideal")
                    )
                )
                
            if len(valid_recommendations) >= max_results:
                break
                
        return valid_recommendations

    except Exception as e:
        logger.error(f"Gemini API error during cart recommendations: {e}")
        return _get_fallback_recommendations(candidates, max_results)
