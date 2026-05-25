use serde::{Serialize, Deserialize};
use uuid::Uuid;
use bigdecimal::BigDecimal;
use crate::models::{Cart, CartItem};

#[derive(Debug, Serialize, Deserialize)]
pub struct CartResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub status: String,
    pub items: Vec<CartItemResponse>,
    pub total: BigDecimal,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CartItemResponse {
    pub id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub unit_price: BigDecimal,
    pub subtotal: BigDecimal,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddItemRequest {
    pub product_id: Uuid,
    pub quantity: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateItemRequest {
    pub quantity: i32,
}

impl CartResponse {
    pub fn from_models(cart: Cart, items: Vec<CartItem>) -> Self {
        let mut total = BigDecimal::from(0);
        let items_resp: Vec<CartItemResponse> = items.into_iter().map(|item| {
            let qty = BigDecimal::from(item.quantity);
            let subtotal = &item.unit_price * qty;
            total += &subtotal;
            CartItemResponse {
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal,
            }
        }).collect();

        Self {
            id: cart.id,
            user_id: cart.user_id,
            status: cart.status,
            items: items_resp,
            total,
        }
    }
}
