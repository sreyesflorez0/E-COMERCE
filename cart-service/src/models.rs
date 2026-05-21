use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::NaiveDateTime;
use bigdecimal::BigDecimal;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Cart {
    pub id: Uuid,
    pub user_id: Uuid,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct CartItem {
    pub id: Uuid,
    pub cart_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub unit_price: BigDecimal,
}
