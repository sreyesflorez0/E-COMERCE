# Product Service

Microservicio de catálogo de productos — Java 21 + Spring Boot 3.4.4

## Responsabilidades
- CRUD de productos
- CRUD de categorías
- Control de acceso por rol (VENDOR, ADMIN)

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | /products | No | Listar productos activos |
| GET | /products/{id} | No | Detalle de producto |
| POST | /products | VENDOR/ADMIN | Crear producto |
| PUT | /products/{id} | VENDOR/ADMIN | Actualizar producto |
| DELETE | /products/{id} | VENDOR/ADMIN | Eliminar (soft delete) |
| GET | /categories | No | Listar categorías |
| POST | /categories | ADMIN | Crear categoría |

## Base de datos
- Puerto: 5435
- DB: product_db
- Tablas: products, categories
