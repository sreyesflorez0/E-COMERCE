mod config;
mod db;
mod models;
mod dto;
mod repository;
mod product_client;
mod rabbitmq;
mod service;
mod handlers;
mod routes;
mod auth;

use std::sync::Arc;
use tracing::info;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let config = Arc::new(config::Config::from_env());
    
    info!("Starting cart-service on port {}", config.port);

    let pool = db::init_db(&config.database_url).await.expect("Failed to connect to database");
    
    let repo = repository::CartRepository::new(pool);
    let product_client = product_client::ProductClient::new(config.clone());
    let rabbitmq = rabbitmq::RabbitMqClient::new(config.clone());

    let service = Arc::new(service::CartService::new(repo, product_client, rabbitmq));

    let app = routes::create_router(service, config.clone());

    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    
    info!("Listening on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
