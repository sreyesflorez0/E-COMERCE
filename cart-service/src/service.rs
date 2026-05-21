use std::sync::Arc;
use uuid::Uuid;
use axum::http::StatusCode;
use bigdecimal::BigDecimal;

use crate::{
    repository::CartRepository,
    product_client::ProductClient,
    rabbitmq::RabbitMqClient,
    dto::{CartResponse, AddItemRequest, UpdateItemRequest},
    models::Cart,
};

#[derive(Clone)]
pub struct CartService {
    repo: CartRepository,
    product_client: ProductClient,
    rabbitmq: RabbitMqClient,
}

impl CartService {
    pub fn new(repo: CartRepository, product_client: ProductClient, rabbitmq: RabbitMqClient) -> Self {
        Self { repo, product_client, rabbitmq }
    }

    pub async fn get_or_create_cart(&self, user_id: Uuid) -> Result<CartResponse, (StatusCode, String)> {
        let cart = match self.repo.get_active_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))? {
            Some(c) => c,
            None => self.repo.create_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?,
        };

        let items = self.repo.get_cart_items(cart.id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        Ok(CartResponse::from_models(cart, items))
    }

    pub async fn add_item(&self, user_id: Uuid, req: AddItemRequest) -> Result<CartResponse, (StatusCode, String)> {
        if req.quantity <= 0 {
            return Err((StatusCode::BAD_REQUEST, "Quantity must be greater than 0".to_string()));
        }

        // Validate product
        let product = self.product_client.get_product(req.product_id).await
            .map_err(|e| (StatusCode::BAD_GATEWAY, format!("Failed to contact product service: {}", e)))?
            .ok_or((StatusCode::NOT_FOUND, "Product not found".to_string()))?;

        if !product.active {
            return Err((StatusCode::BAD_REQUEST, "Product is not active".to_string()));
        }

        if product.stock < req.quantity {
            return Err((StatusCode::BAD_REQUEST, "Insufficient stock".to_string()));
        }

        let cart = match self.repo.get_active_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))? {
            Some(c) => c,
            None => self.repo.create_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?,
        };

        let mut tx = self.repo.begin_tx().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        
        self.repo.add_or_update_item(&mut tx, cart.id, req.product_id, req.quantity, &product.price)
            .await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        tx.commit().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let resp = self.get_or_create_cart(user_id).await?;
        self.publish_update(user_id, &resp).await;
        Ok(resp)
    }

    pub async fn update_item_quantity(&self, user_id: Uuid, item_id: Uuid, req: UpdateItemRequest) -> Result<CartResponse, (StatusCode, String)> {
        let cart = self.repo.get_active_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((StatusCode::NOT_FOUND, "Active cart not found".to_string()))?;

        let mut tx = self.repo.begin_tx().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        
        let updated = self.repo.set_item_quantity(&mut tx, cart.id, item_id, req.quantity)
            .await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if !updated {
            return Err((StatusCode::NOT_FOUND, "Item not found in cart".to_string()));
        }

        tx.commit().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let resp = self.get_or_create_cart(user_id).await?;
        self.publish_update(user_id, &resp).await;
        Ok(resp)
    }

    pub async fn delete_item(&self, user_id: Uuid, item_id: Uuid) -> Result<CartResponse, (StatusCode, String)> {
        let cart = self.repo.get_active_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((StatusCode::NOT_FOUND, "Active cart not found".to_string()))?;

        let mut tx = self.repo.begin_tx().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        
        let deleted = self.repo.delete_item(&mut tx, cart.id, item_id)
            .await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if !deleted {
            return Err((StatusCode::NOT_FOUND, "Item not found in cart".to_string()));
        }

        tx.commit().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let resp = self.get_or_create_cart(user_id).await?;
        self.publish_update(user_id, &resp).await;
        Ok(resp)
    }

    pub async fn clear_cart(&self, user_id: Uuid) -> Result<CartResponse, (StatusCode, String)> {
        let cart = self.repo.get_active_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((StatusCode::NOT_FOUND, "Active cart not found".to_string()))?;

        let mut tx = self.repo.begin_tx().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        self.repo.clear_cart(&mut tx, cart.id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        tx.commit().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        let resp = self.get_or_create_cart(user_id).await?;
        self.publish_update(user_id, &resp).await;
        Ok(resp)
    }

    pub async fn checkout(&self, user_id: Uuid) -> Result<CartResponse, (StatusCode, String)> {
        let cart = self.repo.get_active_cart(user_id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((StatusCode::NOT_FOUND, "Active cart not found".to_string()))?;

        let items = self.repo.get_cart_items(cart.id).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        if items.is_empty() {
            return Err((StatusCode::BAD_REQUEST, "Cannot checkout an empty cart".to_string()));
        }

        let mut tx = self.repo.begin_tx().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        self.repo.update_cart_status(&mut tx, cart.id, "CHECKED_OUT").await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        tx.commit().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        // Return the checked out cart response
        let resp = CartResponse::from_models(cart, items);
        Ok(resp)
    }

    async fn publish_update(&self, user_id: Uuid, cart: &CartResponse) {
        let items_count: i32 = cart.items.iter().map(|i| i.quantity).sum();
        self.rabbitmq.publish_cart_updated(cart.id, user_id, items_count, cart.total.clone()).await;
    }
}
