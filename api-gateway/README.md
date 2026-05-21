# API Gateway

This is the API Gateway microservice for the E-COMMERCE platform. It acts as the single entry point for all HTTP/REST requests, routing them to the appropriate backend microservices.

## Features
- **Centralized Routing:** Proxies requests to `auth-service`, `user-service`, `product-service`, `order-service`, and `serverless-reporting-service`.
- **Authentication:** Validates JWT tokens on protected routes before forwarding. Public routes (like login/register, or public product listings) bypass validation.
- **Security:** Implements `helmet` for security headers, centralized `cors`, and supports `HttpOnly` cookies.
- **Observability:** Centralized request logging using `morgan` and `X-Request-Id` tracing.
- **RabbitMQ Ready:** Prepared to publish `report_requested` events, configurable via `.env`.
- **Future-Proof:** Defines placeholders for `/api/cart`, `/api/payments`, and `/api/notifications` (returning `501 Not Implemented`).

## Requirements
- Node.js 20 LTS

## Setup Local Execution
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust the configuration:
   ```bash
   cp .env.example .env
   ```
   *Nota sobre el Serverless Reporting Service:* Al ser una aplicación AWS SAM, localmente debe correrse con `sam local start-api -p 3000`. El gateway está preparado para conectarse a este puerto de host a través de `http://host.docker.internal:3000`. Si el servicio no está levantado, el proxy retornará un 502/504 temporalmente.

   *Nota sobre RabbitMQ:* La integración hacia la cola de eventos está **desactivada por defecto** (`ENABLE_RABBITMQ=false`), de manera que el gateway no fallará si RabbitMQ no existe, ni intentará publicar eventos que el servicio de reportes actual (orientado a API/cron) no consume.
3. Run in development mode:
   ```bash
   npm run dev
   ```

## Docker Execution
This service is integrated into the root `docker-compose.yml`.
To start the entire cluster including the gateway:
```bash
cd ..
docker-compose up --build
```
The gateway will be accessible at `http://localhost:8080`.

## Endpoints

### Public Routes
- `GET /health` (Gateway Health Check)
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/categories`

### Protected Routes (Requires JWT Authorization Header or Cookie)
- `/api/auth/logout`
- `/api/auth/me`
- `/api/users/**`
- `POST/PUT/DELETE /api/products/**`
- `POST /api/categories`
- `/api/orders/**`
- `/api/reports/**`

### Future Routes (Returns 501 Not Implemented)
- `/api/cart/**`
- `/api/payments/**`
- `/api/notifications/**`

## Testing Commands (cURL)

```bash
# 1. GET /health
curl -v http://localhost:8080/health

# 2. GET /api/products (Pública)
curl -v http://localhost:8080/api/products

# 3. POST /api/auth/login (Pública)
curl -v -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. GET /api/users/me (Protegida) - Sin token
# Esperado: HTTP 401 Unauthorized
curl -v http://localhost:8080/api/users/me

# 5. GET /api/orders (Protegida) - Sin token
# Esperado: HTTP 401 Unauthorized
curl -v http://localhost:8080/api/orders
```

