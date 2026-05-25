-- Referencia documental del esquema para payment-service
-- Estas tablas son creadas automáticamente por SQLAlchemy en el arranque.

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    method VARCHAR,
    paid_at TIMESTAMP
);

CREATE TABLE payment_events (
    id UUID PRIMARY KEY,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
