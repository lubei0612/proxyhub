-- ProxyHub 数据库初始化脚本
-- 创建所有必需的表

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    gift_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    api_key VARCHAR(64) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    remark TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 静态代理表
CREATE TABLE IF NOT EXISTS static_proxies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_id INTEGER REFERENCES orders(id),
    channel_name VARCHAR(100) NOT NULL,
    ip VARCHAR(50) NOT NULL,
    port INTEGER NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    country VARCHAR(10) NOT NULL,
    country_code VARCHAR(10),
    country_name VARCHAR(100) NOT NULL,
    city_name VARCHAR(100),
    ip_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    expire_time_utc TIMESTAMP NOT NULL,
    release_time_utc TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    transaction_no VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    balance_before NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NOT NULL,
    remark TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 使用记录表
CREATE TABLE IF NOT EXISTS usage_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    proxy_type VARCHAR(20) NOT NULL,
    traffic_gb NUMERIC(10,4) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 充值表
CREATE TABLE IF NOT EXISTS recharges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    trade_no VARCHAR(100),
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    remark TEXT,
    reject_reason TEXT,
    admin_remark TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_static_proxies_user_id ON static_proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_static_proxies_status ON static_proxies(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_user_id ON recharges(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_status ON recharges(status);
CREATE INDEX IF NOT EXISTS idx_event_logs_user_id ON event_logs(user_id);

