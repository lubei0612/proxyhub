# ProxyHub UI复刻规范 - 985Proxy风格

## 📌 项目概述

**目标**: 将ProxyHub的用户界面完全复刻为985Proxy的深色主题风格，包括所有图表、表格、表单和交互功能。

**参考源**: 用户提供的985Proxy截图 + 原项目实现 + CODE-REFERENCE

**技术栈**: Vue 3 + Element Plus + ECharts + Tailwind CSS (if needed)

---

## 🎨 UI设计规范

### 1. 主题配色
- **背景色**: 深色主题 (#1a1a1a, #2a2a2a)
- **卡片背景**: 深灰色 (#2d3748)
- **主色调**: 蓝色 (#409eff)
- **文字颜色**: 
  - 主文字: #ffffff
  - 次要文字: #a0aec0
- **边框颜色**: #4a5568

### 2. 布局结构
- **左侧边栏**: 固定宽度200px，深色背景，带Logo和菜单
- **顶部栏**: 固定高度60px，包含欢迎语、余额、语言切换、用户菜单
- **主内容区**: 自适应宽度，padding: 20px

---

## 📊 核心页面需求

### 1. 仪表盘 (Dashboard)

#### 1.1 使用流量概况 - 条形图
**功能**: 展示不同代理类型的流量使用情况
**图表类型**: 横向条形图 (Horizontal Bar Chart)
**数据维度**:
- 数据中心 (Data Center)
- 双ISP静态住宅 (Dual ISP Static)
- 动态住宅 (Dynamic Residential)
- 移动代理 (Mobile Proxy)

**时间筛选**: 
- 开始日期 - 结束日期选择器
- 基于UTC时间统计
- 默认显示最近7天

**技术实现**:
```typescript
// ECharts配置
{
  xAxis: { type: 'value' },
  yAxis: { 
    type: 'category', 
    data: ['数据中心', '双ISP静态住宅', '动态住宅', '移动代理']
  },
  series: [{ type: 'bar' }]
}
```

#### 1.2 网络请求 - 饼状图
**功能**: 展示不同代理类型的请求分布
**图表类型**: 环形饼图 (Doughnut Chart)
**数据维度**: 同上4个类型
**配色**: 
- 粉色、蓝色、紫色、绿色

**技术实现**:
```typescript
{
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    label: { show: true }
  }]
}
```

#### 1.3 流量使用概况 - 折线图
**功能**: 展示不同代理类型的流量趋势
**图表类型**: 多线折线图 (Multi-line Chart)
**数据维度**:
- dc (数据中心)
- mobile (移动代理)
- res_rotating (动态住宅)
- static (静态住宅)

**时间筛选**: 支持年、月、日、周切换
**配色**: 每条线不同颜色（绿、蓝、紫、粉）

---

### 2. 动态住宅管理 (Dynamic Proxy Management)

#### 2.1 列表功能
**表格字段**:
- 通道名 (Channel Name)
- 费用 (Cost)
- 通道限制 (Channel Limit)
- 使用流量 (Traffic Used)
- 花费 (Spending)
- 备注 (Remark)
- 操作 (Actions)

**顶部功能**:
- 添加通道按钮（蓝色）
- 通道名搜索框
- 状态筛选下拉
- 搜索按钮
- 重置按钮

**操作功能**:
- 编辑通道
- 查看详情
- 删除通道

**空状态**: 显示"暂无数据"图标

#### 2.2 购买功能
**注意**: 由于985Proxy未提供购买API，改为"联系客服"按钮
- 点击后显示Telegram客服链接
- 弹窗提示："请联系客服购买动态住宅代理"

---

### 3. 动态住宅选购 (Dynamic Proxy Pricing)

#### 3.1 套餐卡片
**套餐类型**:
1. **现收现付**: 免费 / $5/GB
2. **个人**: $150/365天 / $4.5/GB
3. **商务**: $450/365天 / $4/GB
4. **高级**: $1200/365天 / $3.6/GB
5. **企业定制**: 大客户 / 联系客服

**卡片样式**:
- 深色背景 (#2d3748)
- 标题居中
- 价格大字显示
- 蓝色边框（高亮套餐）
- 立即购买按钮

**功能列表**:
- 并发会话
- 城市级定位
- 1-1440min自定义IP时效
- 流量不过期

#### 3.2 切换选项卡
- **双ISP静态住宅** (默认选中)
- **动态住宅**

---

### 4. 静态住宅管理 (Static Proxy Management)

#### 4.1 表格字段（完整）
```typescript
interface StaticProxyRow {
  通道: string;           // leihou
  IP端口账号密码: string; // 45.197.7.129:7778:f1u1A4Z8O0A1:z1a3O1M3F0x4
  国家城市: string;       // US / Los Angeles
  到期时间: string;       // 2025-11-28 20:55:05 未到期
  释放时间: string;       // 2025-11-29 20:55:05 未释放
  节点ID: string;         // 202510291255056154
  备注: string;           // 暂无备注
  操作: Array;            // [续费, 编辑, 删除]
}
```

#### 4.2 顶部筛选栏
**筛选项**:
- IP类型下拉: 全部 / 普通 / 原生
- 所属通道输入框
- IP:端口:账号:密码 输入框
- 国家选择器
- 到期时间范围选择器
- 释放时间范围选择器
- 节点ID输入框
- 备注搜索框

**操作按钮**:
- 🔍 搜索（蓝色）
- 🔄 重置（灰色）

#### 4.3 批量操作
**顶部批量按钮**:
- 📥 批量导出（支持CSV/TXT格式）
- 💰 批量续费（选中多个IP后批量续费）

**导出格式**:
```
CSV格式:
IP,Port,Username,Password,Country,City,ExpireTime,ReleaseTime,NodeID,Remark

TXT格式:
IP:Port:Username:Password
```

#### 4.4 释放逻辑
- 释放时间 = 到期时间 + 24小时
- 如果不续费，24小时后IP自动回到IP池
- 状态显示: "未到期" / "已到期" / "已释放"

#### 4.5 单行操作
- ✏️ 编辑备注
- 🔄 续费（打开续费弹窗，选择续费时长）
- 🗑️ 释放IP（确认后立即释放）

---

### 5. 钱包充值 (Wallet Recharge)

#### 5.1 顶部余额卡片
```
钱包余额: $35.00
[钱包卡图标] 充值卡兑换
```

#### 5.2 充值金额选择
**快捷金额**: 
- 💰 100.00 (带±按钮)
- 自定义输入框

**优惠券**: 
- 开关切换

#### 5.3 支付方式
**支付方式选项**:
- 🟢 微信支付 (默认选中)
- 🔵 支付宝支付
- 💲 USDT
- 💵 美金

**汇率转换显示**:
```typescript
// 当选择美金时自动显示
充值金额: $100
人民币约: ¥720 (汇率: 1 USD = 7.2 CNY)
```

#### 5.4 温馨提示
```
ℹ️ 所有产品都设支持特惠网络环境下使用
ℹ️ 一次性充值套餐购买套餐，可以根据用户不同需求套餐
ℹ️ 开通过扣刚套餐享优惠折扣优惠，不使用完余额即刻取，不予退款
```

#### 5.5 提交流程
1. 用户填写充值金额和支付方式
2. 点击"确认并支付"
3. 提交充值申请到管理后台
4. 管理员审核
5. 审核通过后自动到账

---

### 6. 静态住宅选购 (Static Proxy Purchase)

#### 6.1 通道名称
**输入框**: "指定唯一一个通道名称，之后将无法重改"
- 必填字段
- 唯一性验证

#### 6.2 住宅IP类型
**单选卡片**:
- 🏠 **普通**: 给过我现门槛的商业社区，适合小型和初创的企业
- 🌟 **原生**: 电子商务，旅游和社交媒体，领域最热门顶级电视的IP

#### 6.3 IP配置

**业务场景**: 输入框（如有）

**IP购买时长**: 
- 30天 / 60天 / 90天 / 180天（按钮切换）

**定位地理位置**: 
- 选择大洲选项卡: 所有 / 欧洲 / 南美洲 / 亚洲 / 北美洲

**国家城市卡片**:
```typescript
interface CountryCard {
  旗帜: string;        // 国旗SVG/图片
  国家: string;        // 阿根廷, Buenos Aires
  价格: string;        // $5/IP
  数量: number;        // 数量: 4
}
```

**卡片样式**:
- 深色背景
- 国旗显示在顶部
- 国家和城市名称
- 价格和库存数量
- 鼠标悬停高亮

#### 6.4 右侧支付面板
```typescript
interface PaymentPanel {
  总IP数: number;      // 0 IPs
  有效期间: string;    // 30 天
  总计费用: number;    // $ 0.00
  总计优惠: number;    // 使用折扣码: $ 0.00
  支付费用: number;    // $ 0.00
  支付方式: string;    // 2 钱包余额支付
  钱包余额: number;    // $ 35.00
}
```

**按钮**: "立即购买IP" (蓝色大按钮)

#### 6.5 价格规则
**普通IP**:
- 30天: $5
- 60天: $10
- 90天: $15
- 180天: $30

**原生IP**:
- 30天: $8
- 60天: $16
- 90天: $24
- 180天: $48

---

### 7. 费用明细 (Billing Details)

#### 7.1 日期范围选择
- 日期范围: 开始日期 - 结束日期
- 筛选周期: 每天 / 每周 / 每月

#### 7.2 数据总览卡片
```typescript
interface BillingSummary {
  总数: number;        // $5.00 (绿色图标)
  日均费用: number;    // $5.00 (橙色图标)
  今天: number;        // $0.00 (蓝色图标)
  产品数: number;      // 1 (青色图标)
}
```

#### 7.3 费用报表
**表格字段**:
- 日期 (Date)
- 动态住宅 (Dynamic)
- 数据中心 (Data Center)
- 双ISP静态住宅 (Dual ISP Static)
- 移动代理 (Mobile)
- 总计 (Total)

**数据示例**:
```
2025-11-01  |  $0.00  |  $0.00  |  $5.00  |  $0.00  |  $5.00
2025-10-31  |  $0.00  |  $0.00  |  $0.00  |  $0.00  |  $0.00
...
```

**分页**: 共7条 | [1] | 20条/页

---

### 8. 交易明细 (Transaction Details)

#### 8.1 筛选栏
- 交易类型下拉: 请选择交易类型
- 时间范围: 开始日期 - 结束日期
- 搜索按钮 / 重置按钮

#### 8.2 表格字段
```typescript
interface Transaction {
  交易时间: string;      // 2025-11-01 08:16:30
  交易类型: string;      // 租用住宅 (蓝色标签)
  金额: number;          // $-5.00 (红色表示支出)
  账户余额: number;      // $35.00
  备注: string;          // Automatic monthly settlement
}
```

**交易类型标签颜色**:
- 租用住宅: 蓝色
- 购买静态IP: 绿色
- 账户充值: 橙色
- 其他: 灰色

**分页**: 共3条 | [1] | 20条/页

---

### 9. 结算记录 (Settlement Records)

#### 9.1 筛选栏
- 结算日期: 开始月份 - 结束月份
- 搜索按钮 / 重置按钮

#### 9.2 顶部提示
**蓝色提示框**:
```
ℹ️ 基于UTC时间统计
```

#### 9.3 表格字段
```typescript
interface Settlement {
  结算日期: string;      // 2025-10-01
  动态住宅: number;      // $0.00
  数据中心: number;      // $0.00
  双ISP静态住宅: number; // $5.00
  移动代理: number;      // $0.00
  总计: number;          // $5.00
  操作: string;          // 查看详情 (按钮)
}
```

**分页**: 共1条 | [1] | 20条/页

---

### 10. 充值订单 (Recharge Orders)

#### 10.1 筛选栏
- 订单号: 输入框
- 交易号: 输入框
- 支付状态: 下拉选择
- 是否退款: 下拉选择
- 下单时间: 开始日期 - 结束日期
- 搜索按钮 / 重置按钮

#### 10.2 表格字段
```typescript
interface RechargeOrder {
  订单号: string;        // ORD20251026...
  交易号: string;        // TXN20251026...
  支付金额: number;      // $40.00
  到账金额: number;      // $40.00
  关金汇率: number;      // $40.00
  支付方式: string;      // 微信 / 支付宝 / USDT
  手续费: number;        // $0.00
  优惠券: string;        // -
  下单时间: string;      // 2025-10-26 14:08:39
}
```

**空状态**: 显示"暂无数据"图标

---

### 11. 账户中心 (Account Center)

#### 11.1 账户信息卡片
```typescript
interface AccountInfo {
  AccountID: string;     // ne_hj06qoml
  安全手机: string;      // 13280502900 (可编辑)
  安全邮箱: string;      // 760117809@qq.com (可编辑)
}
```

**联系方式展示**:
- 商务经理二维码
- 专属客服二维码

#### 11.2 更改密码区域
**表单字段**:
- 当前密码
- 新密码
- 确认新密码
- 立即修改按钮（蓝色）

#### 11.3 API Key管理
```
**********************************************
[复制] [API文档] [重置]
```

---

### 12. 通知设置 (Notification Settings)

#### 12.1 通知开关
```typescript
interface NotificationSettings {
  通知限制即将到期: boolean;  // 开关
  余额不足通知: boolean;      // 开关
  计划到期前通知: boolean;    // 开关
  IP到期通知: boolean;        // 开关
}
```

**样式**: 深色背景，蓝色开关

---

### 13. 事件日志 (Event Log)

#### 13.1 表格字段
```typescript
interface EventLog {
  时间: string;          // 2025-10-26 14:08:39
  事件类型: string;      // 登录成功 / 购买IP / 充值
  IP地址: string;        // 192.168.1.1
  设备信息: string;      // Windows / Chrome
  详情: string;          // 操作详情
}
```

**分页**: 标准分页控件

---

## 🔌 API集成需求

### 1. 985Proxy API集成
**参考文档**: `985Proxy 开放 API 文档.md` + `985proxy-openapi-v20251016.pdf`

**主要接口**:
1. 获取动态住宅通道列表
2. 获取静态IP库存
3. 购买静态IP
4. 获取使用统计数据

### 2. 后端API端点
```typescript
// 仪表盘
GET /api/v1/dashboard/traffic-stats      // 流量统计
GET /api/v1/dashboard/network-requests   // 网络请求统计
GET /api/v1/dashboard/traffic-trend      // 流量趋势

// 动态住宅
GET /api/v1/proxy/dynamic/channels       // 获取通道列表
POST /api/v1/proxy/dynamic/channels      // 添加通道
PUT /api/v1/proxy/dynamic/channels/:id   // 更新通道
DELETE /api/v1/proxy/dynamic/channels/:id // 删除通道

// 静态住宅
GET /api/v1/proxy/static/list            // 获取静态IP列表
POST /api/v1/proxy/static/purchase       // 购买静态IP
PUT /api/v1/proxy/static/:id/renew       // 续费IP
PUT /api/v1/proxy/static/:id/release     // 释放IP
POST /api/v1/proxy/static/export         // 导出IP列表

// 充值
POST /api/v1/billing/recharge            // 提交充值申请
GET /api/v1/billing/recharges            // 获取充值记录

// 账单
GET /api/v1/billing/expenses             // 费用明细
GET /api/v1/billing/transactions         // 交易明细
GET /api/v1/billing/settlements          // 结算记录
GET /api/v1/billing/recharge-orders      // 充值订单

// 用户
GET /api/v1/users/me                     // 获取当前用户
PUT /api/v1/users/profile                // 更新个人信息
POST /api/v1/users/change-password       // 修改密码
POST /api/v1/users/api-key/generate      // 生成API Key

// 通知
GET /api/v1/notifications/settings       // 获取通知设置
PUT /api/v1/notifications/settings       // 更新通知设置
GET /api/v1/notifications/events         // 获取事件日志
```

---

## 🎯 实现优先级

### Phase 1: 核心页面 (P0)
1. ✅ 登录/注册页面
2. ✅ 仪表盘（基础版）
3. 🔄 仪表盘图表（3个图表）
4. 静态住宅管理
5. 静态住宅选购

### Phase 2: 动态住宅 (P1)
1. 动态住宅管理
2. 动态住宅选购（价格展示）

### Phase 3: 账单系统 (P1)
1. 钱包充值
2. 费用明细
3. 交易明细
4. 结算记录
5. 充值订单

### Phase 4: 账户管理 (P2)
1. 账户中心
2. 通知设置
3. 事件日志

---

## 🧪 测试要求

### 1. Chrome DevTools验证
**每完成一个页面必须**:
1. 使用Chrome DevTools打开
2. 检查Console是否有错误
3. 检查Network请求是否正常
4. 截图对比985Proxy界面
5. 测试所有交互功能

### 2. 功能测试清单
- [ ] 登录功能
- [ ] 仪表盘图表加载
- [ ] 静态IP购买流程
- [ ] 充值申请提交
- [ ] 批量导出功能
- [ ] 筛选和搜索功能
- [ ] 分页功能
- [ ] 表单验证

---

## 📦 交付标准

### 1. 代码质量
- TypeScript类型完整
- 组件可复用
- 代码注释清晰
- 无Console错误

### 2. UI还原度
- 布局与985Proxy一致
- 颜色方案匹配
- 字体大小合适
- 图标清晰

### 3. 功能完整性
- 所有按钮可点击
- 表单验证正确
- API请求成功
- 错误处理完善

---

## 📝 备注

1. **优先参考CODE-REFERENCE**: 先查看原项目实现，再自己开发
2. **使用Chrome DevTools**: 每个页面开发完必须调试验证
3. **使用GitHub MCP**: 所有代码变更必须提交Git
4. **国旗图标**: 使用`country-flag-icons`库或`flag-icons`
5. **汇率转换**: 从后端系统设置获取USD到CNY汇率

---

**创建时间**: 2025-11-02  
**创建人**: AI开发助手  
**版本**: v1.0


