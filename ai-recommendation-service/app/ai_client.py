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

def is_locally_relevant(query: str, product: Product) -> bool:
    if not query:
        return True
    
    q_lower = query.lower()
    generic_keywords = {"recomiéndame", "recomiendame", "recomienda", "producto", "algo", "quiero", "busco", "necesito", "un", "una", "para", "el", "la", "los", "las", "de", "del", "que"}
    
    query_words = [w for w in q_lower.split() if w not in generic_keywords]
    
    if not query_words:
        return True

    synonyms = {
        "laptop": ["portátil", "computador", "pc", "ordenador", "portatil"],
        "phone": ["celular", "smartphone", "telefono", "teléfono"],
        "tv": ["televisor", "pantalla", "television", "televisión"]
    }
    
    p_text = f"{product.name} {product.description or ''} {product.categoryId or ''}".lower()
    
    for word in query_words:
        if word in p_text:
            return True
            
        for base_word, syns in synonyms.items():
            if word == base_word or word in syns:
                if base_word in p_text or any(s in p_text for s in syns):
                    return True

    return False

def _get_fallback_recommendations(products: List[Product], max_results: int, query: str = None) -> List[Recommendation]:
    logger.info("[LOG_SEGURO] Usando fallback para recomendaciones")
    fallback = []
    for p in products:
        if query is None or is_locally_relevant(query, p):
            fallback.append(
                Recommendation(
                    product_id=p.id,
                    name=p.name,
                    price=p.price,
                    stock=p.stock,
                    reason="Recomendación general." if not query else "Sugerencia relevante."
                )
            )
        if len(fallback) >= max_results:
            break
            
    if not fallback:
        logger.info("[LOG_SEGURO] Fallback devolvió vacío por baja relevancia.")
    else:
        logger.info(f"[LOG_SEGURO] Productos localmente relevantes encontrados: {len(fallback)}")
        
    return fallback

async def generate_recommendations(query: str, max_results: int, available_products: List[Product]) -> List[Recommendation]:
    # 1. Take up to 20 products to avoid huge payloads
    candidates = available_products[:20]
    
    if not ai_client or not candidates:
        return _get_fallback_recommendations(candidates, max_results, query)

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
                p = candidates_map[pid]
                
                if not is_locally_relevant(query, p):
                    logger.info(f"[LOG_SEGURO] Producto {p.name} excluido por baja relevancia local.")
                    continue
                    
                seen_ids.add(pid)
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
                
        if not valid_recommendations:
            logger.info("[LOG_SEGURO] Gemini devolvió 0 recomendaciones válidas o fueron excluidas por relevancia. Devolviendo [].")
            return []

        logger.info("[LOG_SEGURO] Se usó Gemini exitosamente para recomendaciones.")
        return valid_recommendations

    except Exception as e:
        logger.error(f"Gemini API error during search: {e}")
        return _get_fallback_recommendations(candidates, max_results, query)

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
                
        if not valid_recommendations:
            logger.info("[LOG_SEGURO] Gemini devolvió 0 recomendaciones de carrito válidas. Usando fallback.")
            return _get_fallback_recommendations(candidates, max_results)

        logger.info("[LOG_SEGURO] Se usó Gemini exitosamente para recomendaciones de carrito.")
        return valid_recommendations

    except Exception as e:
        logger.error(f"Gemini API error during cart recommendations: {e}")
        return _get_fallback_recommendations(candidates, max_results)
