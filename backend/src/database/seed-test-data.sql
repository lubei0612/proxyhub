-- ProxyHub 测试数据脚本
-- 插入测试用户和初始数据

-- 清空现有数据（可选，用于重置）
-- TRUNCATE TABLE event_logs, recharges, usage_records, transactions, static_proxies, orders, users RESTART IDENTITY CASCADE;

-- 插入测试用户
-- 密码哈希已使用bcrypt生成
INSERT INTO users (email, password, nickname, role, balance, gift_balance, status) VALUES
-- 普通用户：user@example.com / 123456
('user@example.com', '$2b$10$VwMAz3l7Fl0jR6P0vi4Sp.2UErOnSVs6CQxh/DQqdspeEAcUi0xYu', '测试用户', 'user', 1000.00, 0.00, 'active'),
-- 管理员：admin@example.com / admin123
('admin@example.com', '$2b$10$c7ehqndvMO4237GjO6JOxuxIJgH3SKfUcyWJDiuetJbqKsslCzmNy', '管理员', 'admin', 5000.00, 0.00, 'active'),
-- 测试用户2：test@example.com / test123
('test@example.com', '$2b$10$38mu0UL2JYWZZoNYlbPY9.2HOHY06ZzNhqQP37mKUxMtx693131cm', '测试用户2', 'user', 500.00, 100.00, 'active')
ON CONFLICT (email) DO UPDATE SET updated_at = now();

-- 插入系统设置
INSERT INTO system_settings (key, value, description) VALUES
('telegram_support_1', '@lubei12', 'Telegram客服1'),
('telegram_support_2', '@proxyhub_support', 'Telegram客服2'),
('site_name', 'ProxyHub', '站点名称'),
('site_description', '专业的代理IP管理平台', '站点描述')
ON CONFLICT (key) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();

-- 插入基础价格配置
INSERT INTO price_configs (product_type, base_price, is_active) VALUES
('static_shared_30', 5.00, true),
('static_shared_60', 10.00, true),
('static_shared_90', 14.00, true),
('static_shared_180', 26.00, true),
('static_shared_360', 48.00, true),
('static_premium_30', 8.00, true),
('static_premium_60', 15.00, true),
('static_premium_90', 22.00, true),
('static_premium_180', 40.00, true),
('static_premium_360', 75.00, true)
ON CONFLICT (product_type) DO UPDATE SET updated_at = now();

-- 插入汇率
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('USD', 'CNY', 7.20),
('CNY', 'USD', 0.1389)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
rate = EXCLUDED.rate,
updated_at = now();

-- 提示
SELECT 'Test data seeded successfully!' as message;
SELECT email, role, balance, status FROM users;

