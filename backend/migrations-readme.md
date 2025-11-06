# 数据库迁移指南

## 运行迁移

### 自动运行（推荐）
后端启动时会自动运行待执行的迁移。

### 手动运行
```bash
cd backend
npm run typeorm:migration:run
```

## 回滚迁移
```bash
cd backend
npm run typeorm:migration:revert
```

## 创建新迁移
```bash
cd backend
npm run typeorm:migration:create -- --name MigrationName
```

## 当前迁移列表

| 迁移文件 | 说明 | 添加字段 | 添加索引 |
|---------|------|----------|----------|
| `AddStaticProxyFields1730903400000` | 为static_proxies表添加985Proxy相关字段 | `order_no`, `expire_at`, `plan`, `last_synced_at` | `idx_expire_at`, `idx_order_no`, `idx_last_synced_at` |

## 字段说明

### static_proxies 新增字段

- **order_no** (VARCHAR 255)
  - 985Proxy订单号
  - 用于关联985Proxy的订单
  - 可空（历史数据可能没有）

- **expire_at** (TIMESTAMP)
  - IP到期时间
  - 用于计算剩余天数和状态（active/expiring_soon/expired）
  - 可空

- **plan** (VARCHAR 50)
  - IP套餐类型
  - 值: 'shared' 或 'premium'
  - 默认: 'shared'

- **last_synced_at** (TIMESTAMP)
  - 最后同步时间
  - 记录从985Proxy同步数据的时间
  - 用于定时同步任务
  - 可空

## 索引说明

- **idx_expire_at**: 加速到期时间查询（如查找即将到期的IP）
- **idx_order_no**: 加速订单号查询（如通过订单号查找IP）
- **idx_last_synced_at**: 加速同步任务查询（如查找需要同步的IP）

## 注意事项

1. ⚠️ 运行迁移前请备份数据库
2. ⚠️ 生产环境运行迁移需要停机维护
3. ✅ 迁移是幂等的，可以安全地重复运行
4. ✅ 支持回滚（down方法）
5. ✅ 字段设置为可空，不影响现有数据

## 验证迁移

运行迁移后，验证新字段和索引：

```sql
-- 查看表结构
DESC static_proxies;

-- 查看索引
SHOW INDEX FROM static_proxies;

-- 测试新字段
SELECT id, ip, order_no, expire_at, plan, last_synced_at 
FROM static_proxies 
LIMIT 5;
```

