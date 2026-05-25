# Cart Service

Microservicio de carrito de compras construido en Rust, Axum y PostgreSQL.

## Funcionalidades
- CRUD del carrito de compras.
- Integración con el `product-service` para validar que el producto existe, tiene stock y está activo, obteniendo su precio actual.
- Emisión de evento `cart_updated` hacia RabbitMQ cuando se modifica el carrito.

## Reglas de Negocio / Supuestos Documentados
1. **Validación de Productos**: Para agregar un producto al carrito, el `product-service` debe estar disponible y el producto debe devolver `active=true` y un `stock` mayor a la cantidad solicitada.
2. **Cantidad menor o igual a cero (`quantity <= 0`)**: Como se acordó, si se realiza una actualización en la cantidad de un ítem que resulta en `0` o menos, el ítem se **elimina automáticamente** del carrito activo.
3. **Checkout**: La ruta `POST /cart/checkout` solo marca el carrito como `CHECKED_OUT`. No crea una orden automáticamente en `order-service` debido a que la integración de creación de orden segura no está definida.
4. **Resiliencia de RabbitMQ**: Si RabbitMQ no está disponible, el servicio registrará una alerta en los logs (`warn`), pero no interrumpirá el flujo normal de las peticiones HTTP del usuario.

## Variables de Entorno
Ver el archivo `.env.example`.

## Ejecución
```bash
cargo run
```
