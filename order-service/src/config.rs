use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub server_host: String,
    pub server_port: u16,
    pub product_service_url: String,
}


impl Config {
    pub fn from_env() -> Self {
        Config {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgres://order_user:order_pass@localhost:5436/order_db".to_string()),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "ecommerce-super-secret-jwt-key-change-this-in-production-must-be-256-bits".to_string()),
            server_host: env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            server_port: env::var("SERVER_PORT")
                .unwrap_or_else(|_| "8084".to_string())
                .parse()
                .expect("SERVER_PORT must be a number"),
            product_service_url: env::var("PRODUCT_SERVICE_URL")
                .unwrap_or_else(|_| "http://product-service:8083".to_string()),
        }
    }
}






