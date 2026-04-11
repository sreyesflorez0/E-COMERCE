# Order Service

Microservicio de órdenes — Rust (stable) + Actix-web 4

## Responsabilidades
- Crear órdenes de compra
- Consultar órdenes por ID
- Historial de órdenes del usuario
- Actualización de estado (ADMIN)

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | /orders | Sí | Crear orden |
| GET | /orders/{id} | Sí | Ver orden |
| GET | /orders/my-orders | Sí | Mis órdenes |
| PATCH | /orders/{id}/status | ADMIN | Cambiar estado |

Estados válidos: CREATED, PAID, CANCELLED

## Tecnologías
- Rust (stable toolchain)
- Actix-web 4
- SQLx 0.8 (PostgreSQL async)
- jsonwebtoken 9

## Base de datos
- Puerto: 5436
- DB: order_db
- Tablas: orders, order_items
