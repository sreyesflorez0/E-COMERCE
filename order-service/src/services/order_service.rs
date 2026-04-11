use bigdecimal::BigDecimal;
use reqwest::StatusCode;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::errors::AppError;
use crate::models::*;

pub struct OrderService;

#[derive(Debug, Deserialize)]
struct ProductDto {
    id: Uuid,
    price: BigDecimal,
    active: bool,
}

impl OrderService {
    pub async fn create_order(
        pool: &PgPool,
        config: &Config,
        user_id: Uuid,
        request: CreateOrderRequest,
    ) -> Result<OrderResponse, AppError> {
        if request.items.is_empty() {
            return Err(AppError::BadRequest("La orden debe tener al menos un item".to_string()));
        }

        if request.shipping_address.trim().is_empty() {
            return Err(AppError::BadRequest("La dirección de envío es obligatoria".to_string()));
        }

        let client = reqwest::Client::new();
        let mut total = BigDecimal::from(0);

        for item in &request.items {
            if item.quantity <= 0 {
                return Err(AppError::BadRequest("La cantidad debe ser mayor a 0".to_string()));
            }

            if item.unit_price <= BigDecimal::from(0) {
                return Err(AppError::BadRequest("El precio unitario debe ser mayor a 0".to_string()));
            }

            let product_url = format!("{}/products/{}", config.product_service_url, item.product_id);
            let response = client
                .get(&product_url)
                .send()
                .await
                .map_err(|_| AppError::Internal("No se pudo consultar product-service".to_string()))?;

            if response.status() == StatusCode::NOT_FOUND {
                return Err(AppError::BadRequest(format!(
                    "El producto {} no existe",
                    item.product_id
                )));
            }

            if !response.status().is_success() {
                return Err(AppError::Internal("Error consultando product-service".to_string()));
            }

            let product: ProductDto = response
                .json()
                .await
                .map_err(|_| AppError::Internal("Respuesta inválida de product-service".to_string()))?;

            if !product.active {
                return Err(AppError::BadRequest(format!(
                    "El producto {} no está activo",
                    product.id
                )));
            }

            if product.price != item.unit_price {
                return Err(AppError::BadRequest(format!(
                    "El precio enviado para el producto {} no coincide con el precio actual",
                    product.id
                )));
            }

            let qty = BigDecimal::from(item.quantity);
            total += &item.unit_price * qty;
        }

        let mut tx = pool.begin().await?;

        let order = sqlx::query_as::<_, Order>(
            "INSERT INTO orders (user_id, status, total, shipping_address)
             VALUES ($1, 'CREATED', $2, $3)
             RETURNING *"
        )
        .bind(user_id)
        .bind(&total)
        .bind(&request.shipping_address)
        .fetch_one(&mut *tx)
        .await?;

        let mut item_responses = Vec::new();

        for item in &request.items {
            let subtotal = &item.unit_price * BigDecimal::from(item.quantity);

            let order_item = sqlx::query_as::<_, OrderItem>(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *"
            )
            .bind(order.id)
            .bind(item.product_id)
            .bind(item.quantity)
            .bind(&item.unit_price)
            .bind(&subtotal)
            .fetch_one(&mut *tx)
            .await?;

            item_responses.push(OrderItemResponse {
                id: order_item.id,
                product_id: order_item.product_id,
                quantity: order_item.quantity,
                unit_price: order_item.unit_price,
                subtotal: order_item.subtotal,
            });
        }

        tx.commit().await?;

        Ok(OrderResponse {
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            total: order.total,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            items: item_responses,
        })
    }

    pub async fn get_order_by_id(
        pool: &PgPool,
        order_id: Uuid,
        user_id: Uuid,
        role: &str,
    ) -> Result<OrderResponse, AppError> {
        let order = sqlx::query_as::<_, Order>(
            "SELECT * FROM orders WHERE id = $1"
        )
        .bind(order_id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::NotFound("Orden no encontrada".to_string()))?;

        if order.user_id != user_id && role != "ADMIN" {
            return Err(AppError::Forbidden("No autorizado para ver esta orden".to_string()));
        }

        let items = Self::get_order_items(pool, order.id).await?;

        Ok(OrderResponse {
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            total: order.total,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            items,
        })
    }

    pub async fn get_user_orders(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Vec<OrderResponse>, AppError> {
        let orders = sqlx::query_as::<_, Order>(
            "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC"
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?;

        let mut responses = Vec::new();
        for order in orders {
            let items = Self::get_order_items(pool, order.id).await?;
            responses.push(OrderResponse {
                id: order.id,
                user_id: order.user_id,
                status: order.status,
                total: order.total,
                shipping_address: order.shipping_address,
                created_at: order.created_at,
                items,
            });
        }

        Ok(responses)
    }

    pub async fn update_order_status(
        pool: &PgPool,
        order_id: Uuid,
        new_status: &str,
    ) -> Result<OrderResponse, AppError> {
        let valid_statuses = ["CREATED", "PAID", "CANCELLED"];
        if !valid_statuses.contains(&new_status) {
            return Err(AppError::BadRequest(format!(
                "Estado inválido: {}. Valores permitidos: {:?}",
                new_status, valid_statuses
            )));
        }

        let order = sqlx::query_as::<_, Order>(
            "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *"
        )
        .bind(new_status)
        .bind(order_id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::NotFound("Orden no encontrada".to_string()))?;

        let items = Self::get_order_items(pool, order.id).await?;

        Ok(OrderResponse {
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            total: order.total,
            shipping_address: order.shipping_address,
            created_at: order.created_at,
            items,
        })
    }

    async fn get_order_items(
        pool: &PgPool,
        order_id: Uuid,
    ) -> Result<Vec<OrderItemResponse>, AppError> {
        let items = sqlx::query_as::<_, OrderItem>(
            "SELECT * FROM order_items WHERE order_id = $1"
        )
        .bind(order_id)
        .fetch_all(pool)
        .await?;

        Ok(items
            .into_iter()
            .map(|item| OrderItemResponse {
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal,
            })
            .collect())
    }
}