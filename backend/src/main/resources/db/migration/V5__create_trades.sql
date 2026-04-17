CREATE TABLE trades (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    coin_id BIGINT NOT NULL REFERENCES coins(id),
    trade_type VARCHAR(10) NOT NULL,
    price DECIMAL(20, 4) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    total_amount DECIMAL(20, 4) NOT NULL,
    fee DECIMAL(20, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_trades_user_date ON trades(user_id, created_at DESC);
