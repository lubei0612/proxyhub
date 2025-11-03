# ProxyHub 项目实施计划

## 📋 项目概述

**项目名称**: ProxyHub - 代理IP管理平台
**技术栈**: NestJS + Vue3 + PostgreSQL + Redis
**部署目标**: 腾讯云（Docker容器化部署）
**目标**: 完整复刻985Proxy功能，实现代理IP管理、购买、充值、多语言支持等

---

## 🎯 核心功能需求

### 1. 用户端功能
- ✅ 用户注册/登录（邮箱 + 密码）
- ✅ 仪表盘（使用流量统计、网络请求图表）
- ✅ 静态住宅代理选购和管理
- ✅ 动态住宅代理选购和管理
- ✅ 钱包充值（微信/支付宝/USDT/美金）
- ✅ 账单明细（费用明细、交易明细、结算记录、充值订单）
- ✅ 账户中心和事件日志
- ✅ 多语言支持（简体中文 + 英语）
- ✅ 移动端响应式设计

### 2. 管理端功能
- ✅ 管理员登录（支持多个管理员账号）
- ✅ 用户管理
- ✅ 充值审核
- ✅ 订单管理
- ✅ 系统设置（价格配置、汇率、客服设置）
- ✅ 事件日志（无IP和设备信息，隐私保护）

### 3. 价格系统
- ✅ 普通IP（Shared）: $5/IP/月
- ✅ 原生IP（Premium）: $8/IP/月
- ✅ 支持价格覆盖（国家/城市级别）
- ✅ 汇率换算（USD ↔ CNY）

### 4. 985Proxy API集成
- ✅ 获取库存信息
- ✅ 购买静态IP
- ✅ 获取动态代理套餐
- ✅ 实时流量统计

---

## 📐 技术架构

### 后端架构（NestJS）
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # 认证模块（JWT）
│   │   ├── user/          # 用户管理
│   │   ├── proxy/         # 代理管理（静态/动态）
│   │   ├── billing/       # 账单和交易
│   │   ├── order/         # 订单管理
│   │   ├── admin/         # 管理后台
│   │   ├── dashboard/     # 仪表盘数据
│   │   └── integration/   # 985Proxy API集成（新增）
│   ├── common/            # 公共模块（守卫、装饰器）
│   ├── config/            # 配置
│   └── database/          # 数据库迁移和种子
```

### 前端架构（Vue3）
```
frontend/
├── src/
│   ├── views/             # 页面组件
│   │   ├── dashboard/     # 仪表盘
│   │   ├── proxy/         # 代理管理
│   │   ├── billing/       # 账单明细
│   │   ├── admin/         # 管理后台
│   │   └── ...
│   ├── components/        # 公共组件
│   ├── api/               # API封装
│   ├── stores/            # Pinia状态管理
│   ├── router/            # 路由配置
│   ├── locales/           # 多语言（新增）
│   └── styles/            # 样式（浅色主题）
```

---

## 🚀 实施阶段

### Phase 1: 项目清理和整理 ✅ COMPLETED
- [x] 删除backend/dist和构建缓存
- [x] 删除批处理文件
- [x] 删除重复的admin-portal视图
- [x] 删除多余的docker-compose文件
- [x] 整理项目文档

### Phase 2: 后端核心功能实现 🔄 IN PROGRESS
- [ ] 修正所有API路由和接口
- [ ] 实现价格系统（price_configs + price_overrides表）
- [ ] 实现985Proxy API集成模块
- [ ] 修正用户认证和权限系统
- [ ] 实现多管理员支持
- [ ] 修正事件日志（去除IP和设备信息）

### Phase 3: 前端UI实现 ⏳ PENDING
- [ ] 切换到浅色主题
- [ ] 实现仪表盘（条形图 + 饼图 + 4条曲线折线图）
- [ ] 实现静态住宅选购页面（国旗显示、价格计算）
- [ ] 实现静态住宅管理页面（表格优化、筛选功能）
- [ ] 实现动态住宅管理页面
- [ ] 实现钱包充值页面（备注功能、汇率换算）
- [ ] 实现所有账单页面
- [ ] 实现账户中心和事件日志
- [ ] 实现管理后台所有页面

### Phase 4: 985Proxy API集成 ⏳ PENDING
- [ ] 创建985Proxy服务模块
- [ ] 实现库存查询API
- [ ] 实现静态IP购买API
- [ ] 实现动态代理套餐API
- [ ] 实现流量统计API
- [ ] 配置用户的API Key

### Phase 5: 多语言支持 ⏳ PENDING
- [ ] 安装vue-i18n
- [ ] 创建中英文语言包
- [ ] 实现语言切换功能
- [ ] 翻译所有UI文本

### Phase 6: 移动端适配 ⏳ PENDING
- [ ] 实现响应式布局
- [ ] 优化移动端导航
- [ ] 优化移动端表单
- [ ] 测试各种屏幕尺寸

### Phase 7: 生成测试数据 ⏳ PENDING
- [ ] 创建测试用户（普通用户 + 管理员）
- [ ] 生成静态代理IP数据
- [ ] 生成订单数据
- [ ] 生成充值记录
- [ ] 生成交易记录
- [ ] 生成事件日志

### Phase 8: Chrome DevTools调试和验收 ⏳ PENDING
- [ ] 启动本地开发环境
- [ ] 使用Chrome DevTools调试前端
- [ ] 测试所有用户流程
- [ ] 测试管理员流程
- [ ] 修复所有发现的问题

### Phase 9: GitHub MCP代码管理 ⏳ PENDING
- [ ] 初始化Git仓库
- [ ] 创建.gitignore
- [ ] 提交所有代码
- [ ] 创建分支结构
- [ ] 推送到远程仓库

### Phase 10: 生产环境准备 ⏳ PENDING
- [ ] 优化Docker配置
- [ ] 配置环境变量
- [ ] 配置Nginx
- [ ] 测试生产构建
- [ ] 准备腾讯云部署脚本

---

## 🎨 UI设计规范

### 配色方案（浅色主题）
```css
主题色: #409eff (蓝色)
背景色: #f5f7fa (浅灰)
卡片背景: #ffffff (白色)
文字色: #303133 (深灰)

图表配色（4条曲线）:
- 数据中心: #f56c6c (红色)
- 双ISP静态: #409eff (蓝色)
- 动态住宅: #9b59b6 (紫色)
- 移动代理: #67c23a (绿色)
```

### 仪表盘布局
```
第一行: [条形图] + [饼图] (并排)
第二行: [4条曲线折线图] (占满整行)
```

---

## 📊 数据库设计

### 核心表
- `users` - 用户表
- `recharges` - 充值记录
- `orders` - 订单表
- `static_proxies` - 静态代理IP
- `transactions` - 交易记录
- `event_logs` - 事件日志（无IP/设备信息）
- `price_configs` - 价格配置表（新增）
- `price_overrides` - 价格覆盖表（新增）
- `exchange_rates` - 汇率表（新增）
- `admin_settings` - 管理员设置（新增）

---

## 🔐 环境变量

### 后端 (.env)
```env
# 数据库
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=proxyhub

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 985Proxy API
PROXY_985_API_KEY=待用户提供
PROXY_985_BASE_URL=https://api.985proxy.com

# 汇率
USD_TO_CNY_RATE=7.25
```

### 前端 (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=ProxyHub
```

---

## 🧪 测试计划

### 功能测试清单
1. [ ] 用户注册和登录
2. [ ] 静态IP购买流程
3. [ ] 充值审核流程
4. [ ] 管理员多账号登录
5. [ ] 价格配置和覆盖
6. [ ] 多语言切换
7. [ ] 移动端显示
8. [ ] 985Proxy API对接

---

## 📦 部署流程

### 腾讯云部署步骤
1. 准备服务器（Ubuntu 20.04+）
2. 安装Docker和Docker Compose
3. 克隆代码仓库
4. 配置环境变量
5. 构建Docker镜像
6. 启动服务
7. 配置Nginx反向代理
8. 配置SSL证书
9. 测试所有功能
10. 监控和日志

---

## 📝 当前进度

- **Phase 1**: ✅ 已完成
- **Phase 2**: 🔄 进行中
- **总体进度**: 10%

---

**最后更新**: 2025-11-02
**负责人**: AI Assistant (Claude Sonnet 4.5)

