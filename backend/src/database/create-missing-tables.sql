-- 创建缺失的表

-- 价格配置表
CREATE TABLE IF NOT EXISTS price_configs (
    id SERIAL PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL UNIQUE,
    base_price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 价格覆盖表
CREATE TABLE IF NOT EXISTS price_overrides (
    id SERIAL PRIMARY KEY,
    price_config_id INTEGER NOT NULL REFERENCES price_configs(id),
    country_code VARCHAR(10) NOT NULL,
    city_name VARCHAR(100),
    override_price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(price_config_id, country_code, city_name)
);

-- 汇率表
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate NUMERIC(10,4) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(from_currency, to_currency)
);

-- 事件日志表
CREATE TABLE IF NOT EXISTS event_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    event_content TEXT NOT NULL,
    event_time TIMESTAMP NOT NULL DEFAULT now()
);

