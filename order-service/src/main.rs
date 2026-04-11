mod config;
mod db;
mod errors;
mod handlers;
mod middleware;
mod models;
mod routes;
mod services;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let cfg = config::Config::from_env();
    let pool = db::create_pool(&cfg.database_url).await;

    db::run_migrations(&pool).await;

    log::info!(
        "Order Service starting on {}:{}",
        cfg.server_host,
        cfg.server_port
    );

    let config_data = web::Data::new(cfg.clone());
    let pool_data = web::Data::new(pool);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(config_data.clone())
            .app_data(pool_data.clone())
            .configure(routes::configure_routes)
    })
    .bind(format!("{}:{}", cfg.server_host, cfg.server_port))?
    .run()
    .await
}
