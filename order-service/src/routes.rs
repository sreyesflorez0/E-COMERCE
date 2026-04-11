use actix_web::web;

use crate::handlers::order_handler;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/orders")
            .route("", web::post().to(order_handler::create_order))
            .route("/my-orders", web::get().to(order_handler::get_my_orders))
            .route("/{id}", web::get().to(order_handler::get_order))
            .route("/{id}/status", web::patch().to(order_handler::update_order_status))
    );
}
