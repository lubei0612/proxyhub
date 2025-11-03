-- 只插入测试用户
INSERT INTO users (email, password, nickname, role, balance, gift_balance, status) VALUES
('user@example.com', '$2b$10$VwMAz3l7Fl0jR6P0vi4Sp.2UErOnSVs6CQxh/DQqdspeEAcUi0xYu', '测试用户', 'user', 1000.00, 0.00, 'active'),
('admin@example.com', '$2b$10$c7ehqndvMO4237GjO6JOxuxIJgH3SKfUcyWJDiuetJbqKsslCzmNy', '管理员', 'admin', 5000.00, 0.00, 'active'),
('test@example.com', '$2b$10$38mu0UL2JYWZZoNYlbPY9.2HOHY06ZzNhqQP37mKUxMtx693131cm', '测试用户2', 'user', 500.00, 100.00, 'active')
ON CONFLICT (email) DO UPDATE SET updated_at = now();

SELECT 'Users seeded!' as message;
SELECT id, email, role, balance FROM users;

