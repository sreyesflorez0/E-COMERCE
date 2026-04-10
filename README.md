# 🛒 E-Commerce Microservices Platform

**Universidad E.A.M — Facultad de Ingeniería — Electiva 3**
Armenia, Quindío — Abril 2026

---

## Arquitectura

```
                    ┌──────────────────────────────────────────────┐
                    │              Docker Compose                   │
                    │                                              │
                    │  ┌────────────┐      ┌────────────┐         │
                    │  │ Auth Svc   │      │ User Svc   │         │
                    │  │ :8081      │      │ :8082      │         │
                    │  │ Spring Boot│      │ Spring Boot│         │
                    │  └─────┬──────┘      └─────┬──────┘         │
                    │        │                   │                 │
                    │  ┌─────┴──────┐      ┌─────┴──────┐         │
                    │  │  auth_db   │      │  user_db   │         │
                    │  │  PG :5433  │      │  PG :5434  │         │
                    │  └────────────┘      └────────────┘         │
                    │                                              │
                    │  ┌────────────┐      ┌────────────┐         │
                    │  │Product Svc │      │ Order Svc  │         │
                    │  │ :8083      │      │ :8084      │         │
                    │  │ Spring Boot│      │ Rust/Actix │         │
                    │  └─────┬──────┘      └─────┬──────┘         │
                    │        │                   │                 │
                    │  ┌─────┴──────┐      ┌─────┴──────┐         │
                    │  │ product_db │      │  order_db  │         │
                    │  │  PG :5435  │      │  PG :5436  │         │
                    │  └────────────┘      └────────────┘         │
                    └──────────────────────────────────────────────┘
```

## Tecnologías

| Componente | Tecnología | Versión |
|---|---|---|
| Auth Service | Java + Spring Boot | Java 21 LTS, Spring Boot 3.4.4 |
| User Service | Java + Spring Boot | Java 21 LTS, Spring Boot 3.4.4 |
| Product Service | Java + Spring Boot | Java 21 LTS, Spring Boot 3.4.4 |
| Order Service | Rust + Actix-web | Stable Rust, Actix-web 4 |
| Base de Datos | PostgreSQL | 16 Alpine |
| JWT | JJWT / jsonwebtoken | 0.12.6 / 9.x |
| Build Tool | Maven | 3.9 |
| Contenedores | Docker + Compose | v3.9 |

---

## Requisitos Previos

- **Docker** y **Docker Compose** instalados
- Puertos disponibles: 5433-5436 (PostgreSQL), 8081-8084 (servicios)

---

## 🚀 Cómo Ejecutar

### 1. Clonar y configurar

```bash
# Copiar variables de entorno
cp .env.example .env
```

### 2. Levantar todo con Docker Compose

```bash
docker-compose up --build
```

> La primera ejecución tomará varios minutos descargando imágenes y compilando.

### 3. Verificar que todo funciona

```bash
docker-compose ps
```

Todos los servicios deben estar en estado `Up`.

---

## 📡 Endpoints API

### Auth Service (`:8081`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Registrar usuario |
| POST | `/auth/login` | ❌ | Iniciar sesión |
| POST | `/auth/refresh` | ❌ | Renovar token |
| POST | `/auth/logout` | ✅ | Cerrar sesión |
| GET | `/auth/me` | ✅ | Información del usuario |

### User Service (`:8082`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/users/me` | ✅ | Ver perfil |
| PUT | `/users/me` | ✅ | Actualizar perfil |
| GET | `/users/addresses` | ✅ | Listar direcciones |
| POST | `/users/addresses` | ✅ | Agregar dirección |
| PUT | `/users/addresses/{id}` | ✅ | Actualizar dirección |
| DELETE | `/users/addresses/{id}` | ✅ | Eliminar dirección |

### Product Service (`:8083`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/products` | ❌ | Listar productos |
| GET | `/products/{id}` | ❌ | Detalle de producto |
| POST | `/products` | ✅ VENDOR/ADMIN | Crear producto |
| PUT | `/products/{id}` | ✅ VENDOR/ADMIN | Actualizar producto |
| DELETE | `/products/{id}` | ✅ VENDOR/ADMIN | Eliminar producto |
| GET | `/categories` | ❌ | Listar categorías |
| POST | `/categories` | ✅ ADMIN | Crear categoría |

### Order Service (`:8084`)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/orders` | ✅ | Crear orden |
| GET | `/orders/{id}` | ✅ | Ver orden |
| GET | `/orders/my-orders` | ✅ | Historial de órdenes |
| PATCH | `/orders/{id}/status` | ✅ ADMIN | Cambiar estado |

---

## 🧪 Ejemplo de Uso

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"CLIENT"}'

# 2. Guardar el accessToken de la respuesta, luego:

# 3. Ver perfil (auto-crea el perfil)
curl http://localhost:8082/users/me \
  -H "Authorization: Bearer <TOKEN>"

# 4. Ver catálogo (sin auth)
curl http://localhost:8083/products

# 5. Crear orden
curl -X POST http://localhost:8084/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"shipping_address":"Calle 1 #2-3, Armenia","items":[{"product_id":"uuid","quantity":2,"unit_price":29.99}]}'
```

---

## 📂 Estructura del Proyecto

```
E-COMERCE/
├── docker-compose.yml
├── .env / .env.example
├── README.md
├── auth-service/          (Spring Boot)
├── user-service/          (Spring Boot)
├── product-service/       (Spring Boot)
└── order-service/         (Rust/Actix-web)
```

---

## 🔒 Seguridad

- **JWT** con firma HS256 y secreto compartido entre servicios
- **BCrypt** para hash de contraseñas
- **Refresh Tokens** para renovación sin re-autenticación
- **Roles**: ADMIN, CLIENT, VENDOR
- Cada servicio valida JWT localmente

---

## 🔄 Escalabilidad

### ¿Por qué estos 4 microservicios son suficientes para un MVP?

1. **Auth Service**: Cubre autenticación completa (registro, login, JWT, refresh tokens)
2. **User Service**: Gestión de perfiles y direcciones del usuario
3. **Product Service**: Catálogo completo con categorías y control por vendedor
4. **Order Service**: Ciclo de vida completo de órdenes

Con estos 4 servicios se pueden demostrar los **flujos principales** de un e-commerce: registrarse → explorar productos → realizar pedidos.

### ¿Cómo escalar a la arquitectura completa?

| Servicio Futuro | Propósito | Integración |
|---|---|---|
| Payment Service (Python/FastAPI) | Procesamiento de pagos | Consume orden creada, actualiza estado |
| Cart Service (Rust/Axum) | Carrito de compras | Se integra antes de crear la orden |
| Notification Service (Python/Flask) | Notificaciones | Escucha eventos vía RabbitMQ |
| API Gateway (Node.js/Express) | Punto de entrada único | Proxy reverso hacia todos los servicios |
| Serverless Reporting (Python/Lambda) | Reportes | Consulta datos de órdenes y productos |

La clave es agregar **RabbitMQ** como broker de mensajería para la comunicación asíncrona entre servicios.
