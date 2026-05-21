use axum::{
    routing::{get, post, put, delete},
    Router, middleware,
};
use std::sync::Arc;

use crate::{
    handlers::*,
    service::CartService,
    auth::auth_middleware,
    config::Config,
};

pub fn create_router(service: Arc<CartService>, config: Arc<Config>) -> Router {
    let auth_routes = Router::new()
        .route("/cart", get(get_cart).delete(clear_cart))
        .route("/cart/items", post(add_item))
        .route("/cart/items/:item_id", put(update_item).delete(delete_item))
        .route("/cart/checkout", post(checkout))
        .layer(middleware::from_fn(auth_middleware))
        .with_state(service)
        .layer(axum::Extension(config)); // Provide config to auth middleware

    Router::new()
        .route("/health", get(health_check))
        .merge(auth_routes)
}
