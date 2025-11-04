-- 初始化价格配置表
-- 用于支持价格覆盖管理功能

-- 检查是否已存在配置
SELECT COUNT(*) as existing_configs FROM price_configs WHERE product_type = 'static-residential';

-- 如果不存在，则插入默认配置
INSERT INTO price_configs (product_type, base_price, currency, is_active, created_at, updated_at)
SELECT 
  'static-residential',
  5.00,
  'USD',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM price_configs WHERE product_type = 'static-residential'
);

-- 验证插入结果
SELECT * FROM price_configs WHERE product_type = 'static-residential';

