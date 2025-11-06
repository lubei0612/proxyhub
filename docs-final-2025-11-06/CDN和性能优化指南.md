# ProxyHub CDN和性能优化完整指南

**优化目标**: 提升访问速度、降低服务器压力、增强用户体验

---

## 📊 性能优化概览

### 优化层级

```
用户浏览器
    ↓
CDN边缘节点 (静态资源)
    ↓
Nginx反向代理 (Gzip、缓存)
    ↓
前端容器 (静态文件)
    ↓
后端容器 (API)
    ↓
数据库/Redis (数据存储)
```

### 预期效果

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 首页加载 | 3-5秒 | 0.5-1秒 | 80% ↑ |
| API响应 | 200-500ms | 50-150ms | 70% ↑ |
| 静态资源 | 500ms-2s | 50-200ms | 90% ↑ |
| 服务器负载 | 高 | 低 | 60% ↓ |

---

## 🌐 CDN配置（腾讯云CDN）

### 方案选择

**腾讯云CDN优势**:
- ✅ 与云服务器同在腾讯云，配置简单
- ✅ 国内节点多，访问速度快
- ✅ 按流量计费，成本可控
- ✅ 免费HTTPS证书
- ✅ 防DDoS攻击

### 步骤 1: 开通CDN服务

1. **登录腾讯云控制台**

2. **产品 → CDN内容分发网络**

3. **立即使用** → 开通服务

4. **实名认证**（如果未认证）

---

### 步骤 2: 添加域名

#### 2.1 准备域名

**需要两个子域名**:
- `proxyhub.yourdomain.com` - 主站（前端+API）
- `static.yourdomain.com` - 静态资源（可选，建议）

#### 2.2 配置主站CDN

1. **域名管理 → 添加域名**

2. **基本配置**:
   - 域名: `proxyhub.yourdomain.com`
   - 所属项目: 默认项目
   - 源站类型: **源站IP**
   - 源站地址: `你的服务器IP`
   - 回源协议: HTTP（如果服务器有HTTPS选HTTPS）
   - 加速区域: 中国境内

3. **点击确定** → 等待5-10分钟部署

#### 2.3 配置CNAME

1. **复制CDN提供的CNAME地址**（类似: `proxyhub.yourdomain.com.cdn.dnsv1.com`）

2. **到域名DNS服务商**（如阿里云、腾讯云DNS）

3. **添加CNAME记录**:
   - 主机记录: `proxyhub`
   - 记录类型: `CNAME`
   - 记录值: `复制的CNAME地址`
   - TTL: 600

4. **等待DNS生效**（5-20分钟）

5. **验证**: `ping proxyhub.yourdomain.com` 应该解析到CDN节点

---

### 步骤 3: 配置CDN缓存规则

**域名管理 → 你的域名 → 缓存配置**

#### 3.1 添加缓存规则

**规则1: 静态资源长期缓存**
```
文件类型: jpg;jpeg;png;gif;svg;webp;ico;css;js;woff;woff2;ttf;eot
缓存时间: 30天 (2592000秒)
```

**规则2: HTML文件短期缓存**
```
文件类型: html;htm
缓存时间: 10分钟 (600秒)
```

**规则3: API不缓存**
```
目录: /api/*
缓存时间: 0秒 (不缓存)
```

**规则4: 其他文件**
```
全部文件: *
缓存时间: 1小时 (3600秒)
```

#### 3.2 浏览器缓存

```
启用浏览器缓存: 开启
遵循源站: 关闭
缓存时间: 跟随节点缓存时间
```

---

### 步骤 4: 配置HTTPS

#### 4.1 申请SSL证书

**SSL证书管理 → 申请免费证书**:
- 证书类型: 域名型免费版(DV)
- 域名: proxyhub.yourdomain.com
- 申请邮箱: 你的邮箱
- 验证方式: 自动DNS验证

**等待签发**（5-30分钟）

#### 4.2 配置CDN HTTPS

**域名管理 → HTTPS配置**:
- HTTPS配置: 开启
- 证书来源: 自有证书（选择刚申请的）
- HTTP2.0: 开启
- 强制跳转HTTPS: 开启
- HSTS: 开启（可选）

**保存配置**

---

### 步骤 5: 高级配置

#### 5.1 智能压缩

**高级配置 → 智能压缩**:
- 开启智能压缩
- 文件类型: text/html, text/css, application/javascript, application/json

#### 5.2 防盗链

**访问控制 → 防盗链**:
- 类型: 白名单
- 域名: 
  - `proxyhub.yourdomain.com`
  - `*.yourdomain.com`

#### 5.3 IP访问限频

**访问控制 → IP访问限频**:
- QPS限制: 100（根据实际调整）
- 防止DDoS攻击

#### 5.4 SEO优化

**高级配置 → SEO优化**:
- 开启自动识别跳转

---

## 🚀 Nginx优化配置

### 配置文件优化

#### 如果使用宝塔面板

**网站 → 设置 → 配置文件**，替换为:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name proxyhub.yourdomain.com;
    
    # SSL证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    
    # 前端静态文件
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 静态资源缓存
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://127.0.0.1:8080;
            expires 30d;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }
    
    # 后端API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API不缓存
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### 如果使用纯Nginx

```bash
nano /etc/nginx/sites-available/proxyhub
# 粘贴上面的配置

# 测试配置
nginx -t

# 重启Nginx
systemctl reload nginx
```

---

## ⚡ 前端优化

### 1. 代码分割和懒加载

**已实现** - Vue Router自动代码分割:

```typescript
// router/index.ts 中的路由已使用动态导入
component: () => import('@/views/dashboard/Dashboard.vue')
```

### 2. 图片优化

#### 2.1 使用WebP格式

```bash
# 安装webp转换工具
apt install -y webp

# 批量转换图片
find /opt/proxyhub/frontend/public -name "*.jpg" -o -name "*.png" | while read img; do
    cwebp -q 80 "$img" -o "${img%.*}.webp"
done
```

#### 2.2 使用CDN加速图片

修改前端配置，将图片URL指向CDN:

```typescript
// frontend/src/config/cdn.ts
export const CDN_URL = 'https://static.yourdomain.com'

// 使用
const imageUrl = `${CDN_URL}/images/logo.png`
```

### 3. 预加载关键资源

**index.html** 中添加:

```html
<!-- 预加载字体 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 预连接API域名 -->
<link rel="preconnect" href="https://proxyhub.yourdomain.com">
<link rel="dns-prefetch" href="https://proxyhub.yourdomain.com">
```

---

## 🗄️ 后端优化

### 1. 数据库优化

#### 1.1 添加索引

```sql
-- 为常用查询添加索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_static_proxy_user ON static_proxies(user_id);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_recharge_status ON recharges(status);
```

#### 1.2 连接池配置

**backend/.env.production**:

```bash
DB_POOL_SIZE=20
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE=10000
```

#### 1.3 查询优化

使用select只查询需要的字段:

```typescript
// 不好 - 查询所有字段
await userRepository.find()

// 好 - 只查询需要的字段
await userRepository.find({
  select: ['id', 'email', 'balance']
})
```

### 2. Redis缓存

#### 2.1 缓存热点数据

```typescript
// backend/src/common/cache.service.ts
@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis
  ) {}
  
  // 缓存用户信息
  async cacheUser(userId: string, user: User) {
    await this.redis.set(
      `user:${userId}`,
      JSON.stringify(user),
      'EX',
      3600 // 1小时过期
    );
  }
  
  // 获取缓存
  async getUser(userId: string) {
    const cached = await this.redis.get(`user:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

#### 2.2 缓存API响应

```typescript
// 缓存库存数据（5分钟）
const cacheKey = `inventory:${ipType}:${duration}`;
const cached = await this.redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const inventory = await this.fetch985ProxyInventory();
await this.redis.set(cacheKey, JSON.stringify(inventory), 'EX', 300);
return inventory;
```

### 3. API响应压缩

**已自动启用** - NestJS默认启用compression中间件

---

## 📈 监控和性能分析

### 1. 使用Lighthouse分析

**Chrome浏览器**:
1. F12打开开发者工具
2. Lighthouse标签页
3. 点击"生成报告"

**优化目标**:
- Performance: > 90分
- Accessibility: > 90分
- Best Practices: > 90分
- SEO: > 90分

### 2. 宝塔监控

**监控 → 系统监控**:
- CPU使用率 < 70%
- 内存使用率 < 80%
- 磁盘I/O正常
- 网络流量正常

### 3. CDN监控

**腾讯云CDN → 统计分析**:
- 带宽使用
- 请求数
- 命中率（应 > 80%）
- 状态码分布

---

## 🎯 性能优化清单

### 前端优化

- [x] 代码分割（Vue Router动态导入）
- [ ] 图片懒加载
- [ ] 图片WebP格式
- [ ] 字体子集化
- [ ] 关键CSS内联
- [ ] 预加载关键资源
- [ ] Service Worker（PWA）

### 后端优化

- [x] Gzip压缩
- [ ] 数据库索引优化
- [ ] Redis缓存热点数据
- [ ] API响应缓存
- [ ] 数据库连接池
- [ ] 慢查询日志分析

### CDN优化

- [ ] 腾讯云CDN配置
- [ ] HTTPS启用
- [ ] HTTP/2启用
- [ ] 智能压缩
- [ ] 缓存规则优化
- [ ] 防盗链配置

### Nginx优化

- [x] Gzip压缩
- [ ] 静态资源缓存头
- [ ] HTTP/2支持
- [ ] SSL会话复用
- [ ] 限流配置
- [ ] 日志切割

### 监控优化

- [ ] Lighthouse定期检查
- [ ] CDN命中率监控
- [ ] 服务器资源监控
- [ ] 错误日志监控
- [ ] 用户访问分析

---

## 💰 成本优化

### CDN费用估算

**腾讯云CDN计费**（2025年价格）:
- 流量费用: 约0.2元/GB（境内）
- 月流量1TB: 约200元
- 日访问1000人: 月流量约100GB，费用约20元

**节省技巧**:
- 启用智能压缩（节省30-50%流量）
- 设置合理缓存时间（提高命中率）
- 图片使用WebP（节省50-80%大小）

### 服务器费用

**推荐配置**（使用CDN后）:
- CPU: 2核（足够）
- 内存: 4GB（推荐）
- 带宽: 3Mbps（CDN分担流量）
- 月费用: 约150-300元

---

## 📝 总结

### 实施优先级

**P0（立即执行）**:
1. ✅ 配置Nginx Gzip
2. ✅ 添加静态资源缓存头
3. ⏳ 配置腾讯云CDN
4. ⏳ 启用HTTPS

**P1（本周完成）**:
5. ⏳ 数据库索引优化
6. ⏳ Redis缓存热点数据
7. ⏳ 图片WebP转换
8. ⏳ 配置监控告警

**P2（可选优化）**:
9. ⏳ Service Worker（PWA）
10. ⏳ 图片CDN分离
11. ⏳ 数据库读写分离
12. ⏳ API Rate Limiting

### 预期效果

完成所有优化后:
- 🚀 页面加载速度提升80%+
- 💰 服务器带宽成本降低60%+
- 📈 CDN缓存命中率达到85%+
- ⚡ API响应时间降低50%+
- 😊 用户体验显著提升

**开始优化，让ProxyHub更快更强！** 🎉

