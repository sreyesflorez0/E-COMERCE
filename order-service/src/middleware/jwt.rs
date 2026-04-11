use actix_web::{dev::Payload, web, FromRequest, HttpRequest};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use std::future::{ready, Ready};
use uuid::Uuid;

use crate::config::Config;
use crate::errors::AppError;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    email: String,
    role: String,
    exp: usize,
    iat: usize,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub user_id: Uuid,
    pub email: String,
    pub role: String,
}

impl FromRequest for AuthenticatedUser {
    type Error = AppError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let config = req.app_data::<web::Data<Config>>().unwrap();

        let auth_header = req.headers().get("Authorization");

        let token = match auth_header {
            Some(value) => {
                let header_str = value.to_str().unwrap_or("");
                if header_str.starts_with("Bearer ") {
                    &header_str[7..]
                } else {
                    return ready(Err(AppError::Unauthorized(
                        "Formato de token inválido".to_string(),
                    )));
                }
            }
            None => {
                return ready(Err(AppError::Unauthorized(
                    "Token de autenticación requerido".to_string(),
                )));
            }
        };

        let decoding_key = DecodingKey::from_secret(config.jwt_secret.as_bytes());
        let mut validation = Validation::new(Algorithm::HS512);
        validation.validate_exp = true;

        match decode::<Claims>(token, &decoding_key, &validation) {
            Ok(token_data) => {
                let claims = token_data.claims;
                match Uuid::parse_str(&claims.sub) {
                    Ok(user_id) => ready(Ok(AuthenticatedUser {
                        user_id,
                        email: claims.email,
                        role: claims.role,
                    })),
                    Err(_) => ready(Err(AppError::Unauthorized(
                        "Token inválido: user_id malformado".to_string(),
                    ))),
                }
            }
            Err(err) => {
                log::warn!("JWT validation failed: {:?}", err);
                ready(Err(AppError::Unauthorized(
                    "Token inválido o expirado".to_string(),
                )))
            }
        }
    }
}
