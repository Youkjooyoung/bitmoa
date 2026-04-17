CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    coin_id BIGINT NOT NULL REFERENCES coins(id),
    order_type VARCHAR(10) NOT NULL,
    order_method VARCHAR(10) NOT NULL,
    price DECIMAL(20, 4),
    quantity DECIMAL(20, 8) NOT NULL,
    filled_quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX ix_orders_user_status ON orders(user_id, status);
CREATE INDEX ix_orders_coin_status ON orders(coin_id, status, order_type, price);
