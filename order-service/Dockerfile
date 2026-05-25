# ========== BUILD STAGE ==========
FROM rust:1.88-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Cache dependencies
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>/dev/null || true
RUN rm -rf src

# Build the actual application
COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs && cargo build --release

# ========== RUNTIME STAGE ==========
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/release/order-service .
COPY migrations ./migrations

EXPOSE 8084
CMD ["./order-service"]
