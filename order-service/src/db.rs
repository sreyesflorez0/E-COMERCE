use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn create_pool(database_url: &str) -> PgPool {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
        .expect("Failed to create database pool")
}

pub async fn run_migrations(pool: &PgPool) {
    // Read and execute the migration file
    let migration_sql = include_str!("../migrations/001_create_tables.sql");
    sqlx::raw_sql(migration_sql)
        .execute(pool)
        .await
        .expect("Failed to run migrations");

    log::info!("Database migrations completed successfully");
}
