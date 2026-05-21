use lapin::{options::*, BasicProperties, Connection, ConnectionProperties};
use serde::Serialize;
use std::sync::Arc;
use crate::config::Config;
use uuid::Uuid;
use bigdecimal::BigDecimal;
use chrono::Utc;
use tracing::{warn, info};

#[derive(Clone)]
pub struct RabbitMqClient {
    config: Arc<Config>,
}

#[derive(Serialize)]
pub struct CartUpdatedEvent {
    pub event_type: String,
    pub cart_id: Uuid,
    pub user_id: Uuid,
    pub items_count: i32,
    pub total: BigDecimal,
    pub timestamp: String,
}

impl RabbitMqClient {
    pub fn new(config: Arc<Config>) -> Self {
        Self { config }
    }

    pub async fn publish_cart_updated(&self, cart_id: Uuid, user_id: Uuid, items_count: i32, total: BigDecimal) {
        if !self.config.enable_rabbitmq {
            info!("RabbitMQ is disabled. Skipping cart_updated event for cart_id {}", cart_id);
            return;
        }

        let event = CartUpdatedEvent {
            event_type: "cart_updated".to_string(),
            cart_id,
            user_id,
            items_count,
            total,
            timestamp: Utc::now().to_rfc3339(),
        };

        match self.try_publish(&event).await {
            Ok(_) => info!("Published cart_updated event for cart_id {}", cart_id),
            Err(e) => warn!("Failed to publish cart_updated event (cart_id: {}): {}", cart_id, e),
        }
    }

    async fn try_publish(&self, event: &CartUpdatedEvent) -> Result<(), Box<dyn std::error::Error>> {
        let conn = Connection::connect(&self.config.rabbitmq_url, ConnectionProperties::default()).await?;
        let channel = conn.create_channel().await?;

        let payload = serde_json::to_vec(event)?;

        channel
            .basic_publish(
                &self.config.rabbitmq_exchange,
                &self.config.rabbitmq_routing_key,
                BasicPublishOptions::default(),
                &payload,
                BasicProperties::default(),
            )
            .await?;

        Ok(())
    }
}
