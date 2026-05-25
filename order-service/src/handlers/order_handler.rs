use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::errors::AppError;
use crate::middleware::AuthenticatedUser;
use crate::models::{CreateOrderRequest, UpdateStatusRequest};
use crate::services::OrderService;

pub async fn create_order(
    pool: web::Data<PgPool>,
    config: web::Data<Config>,
    user: AuthenticatedUser,
    body: web::Json<CreateOrderRequest>,
) -> Result<HttpResponse, AppError> {
    let order = OrderService::create_order(
        pool.get_ref(),
        config.get_ref(),
        user.user_id,
        body.into_inner(),
    )
    .await?;

    Ok(HttpResponse::Created().json(order))
}

pub async fn get_order(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let order_id = path.into_inner();
    let order = OrderService::get_order_by_id(pool.get_ref(), order_id, user.user_id, &user.role).await?;
    Ok(HttpResponse::Ok().json(order))
}

pub async fn get_my_orders(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    let orders = OrderService::get_user_orders(pool.get_ref(), user.user_id).await?;
    Ok(HttpResponse::Ok().json(orders))
}

pub async fn get_all_orders(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    if user.role != "ADMIN" {
        return Err(AppError::Forbidden(
            "Solo los administradores pueden listar todas las órdenes".to_string(),
        ));
    }

    let orders = OrderService::get_all_orders(pool.get_ref()).await?;
    Ok(HttpResponse::Ok().json(orders))
}

pub async fn update_order_status(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
    path: web::Path<Uuid>,
    body: web::Json<UpdateStatusRequest>,
) -> Result<HttpResponse, AppError> {
    if user.role != "ADMIN" {
        return Err(AppError::Forbidden(
            "Solo los administradores pueden cambiar el estado de las órdenes".to_string(),
        ));
    }

    let order_id = path.into_inner();
    let order = OrderService::update_order_status(pool.get_ref(), order_id, &body.status).await?;
    Ok(HttpResponse::Ok().json(order))
}