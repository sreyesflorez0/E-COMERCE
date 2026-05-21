use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
    http::StatusCode,
    Extension,
};
use uuid::Uuid;
use std::sync::Arc;

use crate::{
    service::CartService,
    dto::{AddItemRequest, UpdateItemRequest},
    auth::AuthenticatedUser,
};

pub async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, Json(serde_json::json!({"status": "healthy"})))
}

pub async fn get_cart(
    Extension(user): Extension<AuthenticatedUser>,
    State(service): State<Arc<CartService>>,
) -> impl IntoResponse {
    match service.get_or_create_cart(user.id).await {
        Ok(cart) => (StatusCode::OK, Json(serde_json::json!(cart))),
        Err((status, msg)) => (status, Json(serde_json::json!({"error": msg}))),
    }
}

pub async fn add_item(
    Extension(user): Extension<AuthenticatedUser>,
    State(service): State<Arc<CartService>>,
    Json(payload): Json<AddItemRequest>,
) -> impl IntoResponse {
    match service.add_item(user.id, payload).await {
        Ok(cart) => (StatusCode::OK, Json(serde_json::json!(cart))),
        Err((status, msg)) => (status, Json(serde_json::json!({"error": msg}))),
    }
}

pub async fn update_item(
    Extension(user): Extension<AuthenticatedUser>,
    Path(item_id): Path<Uuid>,
    State(service): State<Arc<CartService>>,
    Json(payload): Json<UpdateItemRequest>,
) -> impl IntoResponse {
    match service.update_item_quantity(user.id, item_id, payload).await {
        Ok(cart) => (StatusCode::OK, Json(serde_json::json!(cart))),
        Err((status, msg)) => (status, Json(serde_json::json!({"error": msg}))),
    }
}

pub async fn delete_item(
    Extension(user): Extension<AuthenticatedUser>,
    Path(item_id): Path<Uuid>,
    State(service): State<Arc<CartService>>,
) -> impl IntoResponse {
    match service.delete_item(user.id, item_id).await {
        Ok(cart) => (StatusCode::OK, Json(serde_json::json!(cart))),
        Err((status, msg)) => (status, Json(serde_json::json!({"error": msg}))),
    }
}

pub async fn clear_cart(
    Extension(user): Extension<AuthenticatedUser>,
    State(service): State<Arc<CartService>>,
) -> impl IntoResponse {
    match service.clear_cart(user.id).await {
        Ok(cart) => (StatusCode::OK, Json(serde_json::json!(cart))),
        Err((status, msg)) => (status, Json(serde_json::json!({"error": msg}))),
    }
}

pub async fn checkout(
    Extension(user): Extension<AuthenticatedUser>,
    State(service): State<Arc<CartService>>,
) -> impl IntoResponse {
    match service.checkout(user.id).await {
        Ok(cart) => (StatusCode::OK, Json(serde_json::json!(cart))),
        Err((status, msg)) => (status, Json(serde_json::json!({"error": msg}))),
    }
}
