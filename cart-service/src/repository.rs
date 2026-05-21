use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;
use bigdecimal::BigDecimal;
use crate::models::{Cart, CartItem};

#[derive(Clone)]
pub struct CartRepository {
    pool: PgPool,
}

impl CartRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn get_active_cart(&self, user_id: Uuid) -> Result<Option<Cart>, sqlx::Error> {
        let cart = sqlx::query_as::<_, Cart>(
            "SELECT * FROM carts WHERE user_id = $1 AND status = 'ACTIVE'"
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(cart)
    }

    pub async fn create_cart(&self, user_id: Uuid) -> Result<Cart, sqlx::Error> {
        let id = Uuid::new_v4();
        let cart = sqlx::query_as::<_, Cart>(
            "INSERT INTO carts (id, user_id, status) VALUES ($1, $2, 'ACTIVE') RETURNING *"
        )
        .bind(id)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;
        
        Ok(cart)
    }

    pub async fn get_cart_items(&self, cart_id: Uuid) -> Result<Vec<CartItem>, sqlx::Error> {
        let items = sqlx::query_as::<_, CartItem>(
            "SELECT * FROM cart_items WHERE cart_id = $1"
        )
        .bind(cart_id)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(items)
    }

    pub async fn add_or_update_item(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        cart_id: Uuid,
        product_id: Uuid,
        quantity_diff: i32,
        unit_price: &BigDecimal,
    ) -> Result<(), sqlx::Error> {
        let existing = sqlx::query_as::<_, CartItem>(
            "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 FOR UPDATE"
        )
        .bind(cart_id)
        .bind(product_id)
        .fetch_optional(&mut **tx)
        .await?;

        if let Some(item) = existing {
            let new_qty = item.quantity + quantity_diff;
            if new_qty <= 0 {
                sqlx::query("DELETE FROM cart_items WHERE id = $1")
                    .bind(item.id)
                    .execute(&mut **tx)
                    .await?;
            } else {
                sqlx::query("UPDATE cart_items SET quantity = $1, unit_price = $2 WHERE id = $3")
                    .bind(new_qty)
                    .bind(unit_price)
                    .bind(item.id)
                    .execute(&mut **tx)
                    .await?;
            }
        } else {
            if quantity_diff > 0 {
                let item_id = Uuid::new_v4();
                sqlx::query("INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)")
                    .bind(item_id)
                    .bind(cart_id)
                    .bind(product_id)
                    .bind(quantity_diff)
                    .bind(unit_price)
                    .execute(&mut **tx)
                    .await?;
            }
        }

        sqlx::query("UPDATE carts SET updated_at = NOW() WHERE id = $1")
            .bind(cart_id)
            .execute(&mut **tx)
            .await?;

        Ok(())
    }

    pub async fn set_item_quantity(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        cart_id: Uuid,
        item_id: Uuid,
        new_quantity: i32,
    ) -> Result<bool, sqlx::Error> {
        if new_quantity <= 0 {
            let result = sqlx::query("DELETE FROM cart_items WHERE id = $1 AND cart_id = $2")
                .bind(item_id)
                .bind(cart_id)
                .execute(&mut **tx)
                .await?;
            return Ok(result.rows_affected() > 0);
        }

        let result = sqlx::query("UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3")
            .bind(new_quantity)
            .bind(item_id)
            .bind(cart_id)
            .execute(&mut **tx)
            .await?;
            
        Ok(result.rows_affected() > 0)
    }

    pub async fn delete_item(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        cart_id: Uuid,
        item_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM cart_items WHERE id = $1 AND cart_id = $2")
            .bind(item_id)
            .bind(cart_id)
            .execute(&mut **tx)
            .await?;
            
        Ok(result.rows_affected() > 0)
    }

    pub async fn clear_cart(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        cart_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM cart_items WHERE cart_id = $1")
            .bind(cart_id)
            .execute(&mut **tx)
            .await?;
            
        Ok(())
    }

    pub async fn update_cart_status(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        cart_id: Uuid,
        status: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE carts SET status = $1, updated_at = NOW() WHERE id = $2")
            .bind(status)
            .bind(cart_id)
            .execute(&mut **tx)
            .await?;
            
        Ok(())
    }

    pub async fn begin_tx(&self) -> Result<Transaction<'_, Postgres>, sqlx::Error> {
        self.pool.begin().await
    }
}
