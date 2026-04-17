CREATE TABLE holdings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    coin_id BIGINT NOT NULL REFERENCES coins(id),
    quantity DECIMAL(20, 8) NOT NULL,
    avg_buy_price DECIMAL(20, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT uq_holdings_user_coin UNIQUE (user_id, coin_id)
);

CREATE INDEX ix_holdings_user_coin ON holdings(user_id, coin_id);
