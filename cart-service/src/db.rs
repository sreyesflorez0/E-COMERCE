use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn init_db(database_url: &str) -> Result<PgPool, sqlx::Error> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    // Run migrations automatically
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;

    Ok(pool)
}
