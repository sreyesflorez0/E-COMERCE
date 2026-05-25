use actix_web::{HttpResponse, ResponseError};
use serde::Serialize;
use std::fmt;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    NotFound(String),
    Unauthorized(String),
    Forbidden(String),
    Internal(String),
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub status: u16,
    pub message: String,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::BadRequest(msg) => write!(f, "Bad Request: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            AppError::Forbidden(msg) => write!(f, "Forbidden: {}", msg),
            AppError::Internal(msg) => write!(f, "Internal Error: {}", msg),
        }
    }
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::BadRequest(msg) => {
                HttpResponse::BadRequest().json(ErrorResponse { status: 400, message: msg.clone() })
            }
            AppError::NotFound(msg) => {
                HttpResponse::NotFound().json(ErrorResponse { status: 404, message: msg.clone() })
            }
            AppError::Unauthorized(msg) => {
                HttpResponse::Unauthorized().json(ErrorResponse { status: 401, message: msg.clone() })
            }
            AppError::Forbidden(msg) => {
                HttpResponse::Forbidden().json(ErrorResponse { status: 403, message: msg.clone() })
            }
            AppError::Internal(msg) => {
                HttpResponse::InternalServerError().json(ErrorResponse { status: 500, message: msg.clone() })
            }
        }
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        log::error!("Database error: {:?}", err);
        AppError::Internal("Error de base de datos".to_string())
    }
}
