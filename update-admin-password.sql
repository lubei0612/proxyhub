-- 更新管理员密码为: Admin123456
-- 密码要求: 至少8字符，包含大写、小写、数字
UPDATE users
SET password = '$2b$10$SSzIpnX/7ClOgIJNB8clTu1UQrYI8FqJNcTuc1bXt87WZQz5XIQDC'
WHERE email = 'admin@proxyhub.com';

-- 验证更新
SELECT id, email, role, 
       SUBSTRING(password, 1, 20) || '...' as password_hash,
       created_at
FROM users 
WHERE email = 'admin@proxyhub.com';

