CREATE TABLE coins (
    id BIGSERIAL PRIMARY KEY,
    market VARCHAR(20) NOT NULL UNIQUE,
    korean_name VARCHAR(50) NOT NULL,
    english_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX ix_coins_market ON coins(market);
