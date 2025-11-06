-- ========================================
-- ProxyHub Mock数据清理脚本 (PostgreSQL版本)
-- ========================================
-- 执行前请确保已备份数据库！
-- ========================================

-- 删除所有非985Proxy的静态代理
DELETE FROM static_proxies 
WHERE remark LIKE '%[MOCK]%' 
   OR channel_name = '默认通道'
   OR channel_name != '985Proxy';

-- 删除所有非985Proxy的订单 (假设985Proxy订单在remark中包含'985Proxy')
DELETE FROM orders 
WHERE remark NOT LIKE '%985Proxy%'
   OR remark IS NULL;

-- 删除所有非985Proxy的交易 (假设985Proxy交易在remark中包含'985Proxy')
DELETE FROM transactions 
WHERE remark NOT LIKE '%985Proxy%'
   OR remark IS NULL;

-- 验证清理结果
SELECT '==== 清理完成！验证结果 ====' AS status;

SELECT 
  'static_proxies' AS table_name,
  COUNT(*) AS remaining_count,
  STRING_AGG(DISTINCT channel_name, ', ') AS channels
FROM static_proxies
GROUP BY table_name;

SELECT 
  'orders' AS table_name,
  COUNT(*) AS remaining_count
FROM orders;

SELECT 
  'transactions' AS table_name,
  COUNT(*) AS remaining_count
FROM transactions;

-- 可选：重置序列（如果需要）
-- ALTER SEQUENCE static_proxies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE transactions_id_seq RESTART WITH 1;

