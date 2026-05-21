use reqwest::Client;
use serde::Deserialize;
use uuid::Uuid;
use bigdecimal::BigDecimal;
use std::sync::Arc;
use crate::config::Config;

#[derive(Clone)]
pub struct ProductClient {
    client: Client,
    base_url: String,
}

#[derive(Deserialize, Debug)]
pub struct ProductResponse {
    pub id: Uuid,
    pub price: BigDecimal,
    pub stock: i32,
    pub active: bool,
}

impl ProductClient {
    pub fn new(config: Arc<Config>) -> Self {
        Self {
            client: Client::new(),
            base_url: config.product_service_url.clone(),
        }
    }

    pub async fn get_product(&self, product_id: Uuid) -> Result<Option<ProductResponse>, reqwest::Error> {
        let url = format!("{}/products/{}", self.base_url, product_id);
        let resp = self.client.get(&url).send().await?;

        if resp.status().is_success() {
            let product = resp.json::<ProductResponse>().await?;
            Ok(Some(product))
        } else if resp.status() == reqwest::StatusCode::NOT_FOUND {
            Ok(None)
        } else {
            // Other error statuses will bubble up if we use error_for_status
            resp.error_for_status()?;
            Ok(None) // Unreachable due to error_for_status
        }
    }
}
