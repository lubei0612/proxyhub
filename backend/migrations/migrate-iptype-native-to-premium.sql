-- 数据库迁移脚本：将 ipType 从 'native' 更新为 'premium'
-- 运行时间：2025-11-15
-- 目的：统一IP类型标识，确保与前端和985Proxy API一致

-- 1. 检查当前数据状态
SELECT 
    ip_type, 
    COUNT(*) as count 
FROM static_proxies 
WHERE ip_type IN ('native', 'premium', 'shared', 'normal')
GROUP BY ip_type;

-- 2. 更新所有 'native' 为 'premium'
UPDATE static_proxies 
SET ip_type = 'premium' 
WHERE ip_type = 'native';

-- 3. 为了向后兼容，也更新可能存在的 'normal' 为 'shared'
UPDATE static_proxies 
SET ip_type = 'shared' 
WHERE ip_type = 'normal';

-- 4. 验证更新结果
SELECT 
    ip_type, 
    COUNT(*) as count 
FROM static_proxies 
GROUP BY ip_type;

-- 预期结果：只应该有 'shared' 和 'premium' 两种类型

-- 5. 记录迁移日志
-- （可选）如果有 migration_logs 表
-- INSERT INTO migration_logs (migration_name, executed_at, status) 
-- VALUES ('migrate-iptype-native-to-premium', NOW(), 'success');

