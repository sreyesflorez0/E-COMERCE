# AI Recommendation Service

Microservicio stateless construido con FastAPI y `google-genai` para proporcionar recomendaciones inteligentes de productos.

## Tecnologías
- Python 3.12
- FastAPI
- Google GenAI (Gemini 2.0 Flash)
- PyJWT
- httpx

## Requisitos previos y Configuración

1. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```
2. Obtener una clave de API de Gemini (`GEMINI_API_KEY`):
   - Ve a [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Crea un nuevo proyecto y genera una API Key.
   - Pégala en el `.env`.

## Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:8088/health
# o a través del Gateway
curl -X GET http://localhost:8080/api/recommendations/health
```

### 2. Trending (Sin IA)
```bash
curl -X GET http://localhost:8080/api/recommendations/trending
```

### 3. Search Recommendations (Requiere JWT)
Asegúrate de pasar tu token en el header o como cookie `accessToken`.
```bash
curl -X POST http://localhost:8080/api/recommendations/search \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "quiero un portátil barato para estudiar",
    "max_results": 5
  }'
```

### 4. Cart Recommendations (Requiere JWT)
Recomienda productos basados en el carrito actual.
```bash
curl -X GET http://localhost:8080/api/recommendations/cart \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Pruebas de Fallback
Si deseas probar el mecanismo de fallback (cuando Gemini falla), puedes intentar una de estas opciones:
1. Pon una `GEMINI_API_KEY` inválida en tu `.env`.
2. Llama al endpoint de `/search` o `/cart`.
3. Verás que no devuelve error 500, sino una lista de productos generales (fallback gracefull) y los logs internos reflejarán la falla de inicialización o cuota excedida.

## Integración con Gateway
El API Gateway delega los requests a `/api/recommendations/**` usando path rewrite hacia `/recommendations/**` en el puerto 8088.

Logs seguros: La API Key y el JWT completo nunca se imprimen. Solo errores generales o el status de la llamada (ej. `Calling Gemini API...`).
