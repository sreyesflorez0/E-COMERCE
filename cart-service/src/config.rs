use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_algorithm: String,
    pub product_service_url: String,
    pub enable_rabbitmq: bool,
    pub rabbitmq_url: String,
    pub rabbitmq_exchange: String,
    pub rabbitmq_routing_key: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();
        
        let enable_rabbitmq = env::var("ENABLE_RABBITMQ").unwrap_or_else(|_| "false".to_string()) == "true";
        
        Config {
            port: env::var("PORT").unwrap_or_else(|_| "8085".to_string()).parse().unwrap_or(8085),
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
            jwt_algorithm: env::var("JWT_ALGORITHM").unwrap_or_else(|_| "HS512".to_string()),
            product_service_url: env::var("PRODUCT_SERVICE_URL").expect("PRODUCT_SERVICE_URL must be set"),
            enable_rabbitmq,
            rabbitmq_url: env::var("RABBITMQ_URL").unwrap_or_else(|_| "amqp://guest:guest@localhost:5672".to_string()),
            rabbitmq_exchange: env::var("RABBITMQ_EXCHANGE").unwrap_or_else(|_| "ecommerce.events".to_string()),
            rabbitmq_routing_key: env::var("RABBITMQ_ROUTING_KEY").unwrap_or_else(|_| "cart_updated".to_string()),
        }
    }
}
