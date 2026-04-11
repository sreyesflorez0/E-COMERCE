use bigdecimal::BigDecimal;
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct OrderItem {
    pub id: Uuid,
    pub order_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub unit_price: BigDecimal,
    pub subtotal: BigDecimal,
}

#[derive(Debug, Serialize)]
pub struct OrderItemResponse {
    pub id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub unit_price: BigDecimal,
    pub subtotal: BigDecimal,
}
