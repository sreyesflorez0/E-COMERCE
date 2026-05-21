use axum::{
    extract::Request,
    http::{StatusCode, header},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::sync::Arc;
use crate::config::Config;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // Typically email or user_id depending on how it's created
    // If the auth-service generates a 'userId' claim, we should extract it.
    // Standard approach might use sub as email, and a custom claim for user id.
    // Assuming 'id' or 'userId' is in the token. We'll try 'userId' first, then 'sub' if it's a UUID.
    #[serde(alias = "userId", alias = "id")]
    pub user_id: Option<String>,
    pub role: Option<String>,
}

#[derive(Clone)]
pub struct AuthenticatedUser {
    pub id: Uuid,
    pub role: String,
}

pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let config = req.extensions().get::<Arc<Config>>().expect("Config missing in extensions").clone();

    let auth_header = req.headers().get(header::AUTHORIZATION)
        .and_then(|val| val.to_str().ok())
        .and_then(|s| if s.starts_with("Bearer ") { Some(&s[7..]) } else { None });

    let token = if let Some(t) = auth_header {
        t
    } else {
        // Also try cookie if present
        let cookie_header = req.headers().get(header::COOKIE).and_then(|v| v.to_str().ok());
        let mut found_cookie = None;
        if let Some(cookies) = cookie_header {
            for cookie in cookies.split(';') {
                let cookie = cookie.trim();
                if cookie.starts_with("accessToken=") {
                    found_cookie = Some(&cookie[12..]);
                    break;
                }
            }
        }
        
        if let Some(t) = found_cookie {
            t
        } else {
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    let alg = if config.jwt_algorithm == "HS512" { Algorithm::HS512 } else { Algorithm::HS256 };
    let mut validation = Validation::new(alg);
    validation.validate_exp = true;
    validation.validate_nbf = false;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.jwt_secret.as_bytes()),
        &validation,
    ).map_err(|e| {
        tracing::error!("JWT Validation error: {}", e);
        StatusCode::UNAUTHORIZED
    })?;

    // Determine UUID from sub or user_id
    let user_id_str = token_data.claims.user_id.unwrap_or(token_data.claims.sub);
    let user_id = Uuid::parse_str(&user_id_str).map_err(|_| {
        tracing::error!("Failed to parse user ID as UUID");
        StatusCode::UNAUTHORIZED
    })?;

    let role = token_data.claims.role.unwrap_or_else(|| "CLIENT".to_string());

    let auth_user = AuthenticatedUser { id: user_id, role };
    req.extensions_mut().insert(auth_user);

    Ok(next.run(req).await)
}
