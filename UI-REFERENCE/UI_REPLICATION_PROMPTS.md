# 🎨 ProxyHub UI 复刻专用提示词

## 📋 使用说明

这些提示词专门用于**复刻您满意的UI设计**。按照顺序使用这些提示词，AI会严格按照现有UI风格实现所有页面。

---

## 🚀 阶段1：建立UI基础（必须先执行）

### 提示词 1.1：创建样式系统

```
【建立UI样式系统】

请根据 UI-REFERENCE/UI_DESIGN_GUIDE.md 创建完整的样式系统：

1. 创建 frontend/src/assets/styles/variables.scss
   - 定义所有颜色变量
   - 定义布局变量（圆角、间距、阴影）
   - 定义字体变量

2. 创建 frontend/src/assets/styles/mixins.scss
   - 常用混合器（flex布局、卡片样式、空状态等）

3. 创建 frontend/src/assets/styles/global.scss
   - 全局样式重置
   - Element Plus 主题覆盖

要求：
- 严格按照 UI_DESIGN_GUIDE.md 中的"通用样式变量"章节
- 颜色方案：主色 #409EFF，背景 #f5f7fa，白色卡片
- 卡片圆角 8px，间距 16-20px
```

---

### 提示词 1.2：创建FlagIcon组件

```
【创建国旗图标组件】

这是一个关键的UI组件，在多个页面中使用。

请创建 frontend/src/components/common/FlagIcon.vue：

功能要求：
1. 使用 country-flag-icons npm包（SVG格式）
2. 接收 props：
   - countryCode: string (ISO 3166-1 alpha-2，如 'US', 'GB')
   - size: number (默认24px)
   - squared: boolean (方形/矩形，默认false)
3. 错误处理：
   - 图片加载失败时显示国家代码文本
   - 灰色背景 + 边框
4. 样式：
   - 圆角 2px
   - overflow: hidden
   - 支持自适应尺寸

参考实现：UI-REFERENCE/components/FlagIcon.vue（如果存在）

验收标准：
- <FlagIcon country-code="US" :size="20" /> 显示美国国旗
- 加载失败显示 "US" 文本后备
```

---

## 🎨 阶段2：核心页面UI（静态代理模块）

### 提示词 2.1：StaticBuy页面（重点！）

```
【复刻静态代理购买页面UI】

这是核心页面，需要严格按照现有设计实现。

页面位置：frontend/src/views/proxy/StaticBuy.vue

UI设计要求（参考 UI_DESIGN_GUIDE.md 第1节）：

【布局结构】
1. Channel Name Card（顶部）
   - 单个输入框
   - placeholder: "Channel Name (cannot be changed later)"
   - 白色卡片，圆角8px

2. IP Type Card
   - 标题 "IP Type"
   - IPTypeSelector 组件（普通IP / 原生IP）

3. IP Configuration Card
   - 标题 "IP Configuration"
   - 三个配置行：
     * Business Scenario（业务场景选择器）
     * Region（地区标签页）
     * Country Tabs（国家标签页，带国旗）

4. Purchase Duration Card
   - 标题 "Purchase Duration"
   - 4个单选按钮：30/60/90/180天

5. Main Content（左右分栏）
   - 左侧：IP Pool Section
     * 标题显示数量："Available IP Pool (X)"
     * Grid布局：repeat(auto-fill, minmax(220px, 1fr))
     * CountryCard 组件显示：国旗 + 国家名 + 城市 + 库存 + 价格 + 数量选择器
   
   - 右侧：Payment Panel（固定宽度360px）
     * 显示购物车商品列表
     * 显示总价和余额
     * 确认购买按钮
     * 清空购物车按钮

【样式要求】
- 页面背景：#f5f7fa
- 所有卡片：白色背景，圆角8px，border: 1px solid #e4e7ed
- 卡片间距：margin-bottom: 16px
- Main Content 间距：gap: 20px
- 响应式：小屏幕时变为上下布局

【子组件】需要创建：
- IPTypeSelector.vue（普通IP/原生IP选择器）
- ScenarioSelector.vue（业务场景下拉选择）
- RegionTabs.vue（地区标签页）
- CountryTabs.vue（国家标签页，显示国旗）
- CountryCard.vue（国家IP卡片）
- PaymentPanel.vue（支付详情面板）

参考：
- UI_DESIGN_GUIDE.md 的"静态代理购买页面"章节
- 使用 FlagIcon 组件显示国旗
```

---

### 提示词 2.2：PaymentPanel组件（重点！）

```
【创建支付详情面板组件】

组件位置：frontend/src/components/proxy/PaymentPanel.vue

UI设计要求：

【布局】
- 固定宽度：360px
- 白色卡片背景
- 圆角8px
- Shadow：$card-shadow

【内容区域】
1. Header
   - 标题："Payment Details"
   - 清空购物车按钮（右侧，危险色）

2. Cart Items List（如果有商品）
   - 每个商品显示：
     * 国旗图标（使用 FlagIcon 组件）
     * 国家名 + 城市名
     * IP类型标签（Normal/Native）
     * 数量选择器（+/- 按钮）
     * 单价和小计
     * 删除按钮
   - 商品之间分隔线

3. Empty State（如果购物车为空）
   - 空状态图标
   - 提示文字："No items in cart"
   - 说明文字："Select IPs from the pool to get started"
   - **重要**：仍然显示支付详情区域，只是商品列表为空

4. Summary Section
   - Total Quantity: X IPs
   - Total Price: $XX.XX（大字体，粗体）
   - Current Balance: $XX.XX

5. Actions
   - 确认购买按钮（全宽，type="success"，大尺寸）
   - 余额不足时禁用并显示提示

【Props】
- cartItems: CartItem[]
- totalPrice: number
- balance: number
- selectedDuration: number
- scenario: string

【Events】
- @purchase: 触发购买
- @clear-cart: 清空购物车
- @update-quantity: (itemId, quantity) => void
- @remove-item: (itemId) => void

【样式要求】
- 使用 Element Plus 组件
- 卡片padding: 20px
- 按钮间距: 12px
- 商品间距: 16px
```

---

### 提示词 2.3：StaticManage页面

```
【创建静态代理管理页面UI】

页面位置：frontend/src/views/proxy/StaticManage.vue

UI设计要求（参考 UI_DESIGN_GUIDE.md 第2节）：

【布局结构】
1. Page Header
   - 左侧：标题 "Static Proxy Management"
   - 右侧：操作按钮
     * 批量导出按钮（显示选中数量）
     * 批量续费按钮（显示选中数量）

2. Filter Card
   - 内联表单布局
   - IP搜索输入框
   - 国家下拉选择
   - IP类型单选按钮组（所有/普通IP/原生IP）
   - 搜索按钮 + 重置按钮

3. Data Table Card
   - 复选框列（支持全选）
   - IP凭证列："IP:端口:账号:密码"（带复制按钮）
   - 国家/城市列（带国旗图标，使用 FlagIcon）
   - 类型列（标签：Normal/Native）
   - 到期时间列（显示剩余天数 + 状态标签）
   - 释放时间列
   - 操作列（续费按钮 + 释放按钮）

4. Empty State（如果无数据）
   - 空状态图标
   - 提示文字："No static proxies"
   - "Go to Purchase" 按钮

【样式要求】
- 浅色系主题（与StaticBuy一致）
- 表格行悬停高亮
- 状态标签颜色：
  * 剩余>7天：success（绿色）
  * 剩余<=7天：warning（黄色）
  * 已过期：danger（红色）

【功能要求】
- 批量选择
- 批量导出（TXT/CSV格式）
- 批量续费（弹窗选择时长）
- 单个续费
- 单个释放（确认弹窗）
- 复制IP凭证到剪贴板
```

---

## 🏠 阶段3：其他核心页面

### 提示词 3.1：Dashboard页面

```
【创建用户仪表盘页面UI】

页面位置：frontend/src/views/dashboard/Index.vue

UI设计要求：

【布局】
1. 账户概览卡片（4个统计卡片，Grid布局）
   - 当前余额（显示金额，绿色）
   - 动态代理数量
   - 静态代理数量
   - 移动代理数量

2. 快捷操作卡片
   - 4个大按钮（带图标）：
     * 购买动态代理
     * 购买静态代理
     * 钱包充值
     * 查看订单

3. 使用概况卡片
   - 标题："Usage Overview"
   - ECharts折线图
   - 显示最近7天的流量使用趋势
   - 支持切换代理类型（动态/静态）

4. 最近订单卡片
   - 标题："Recent Orders"
   - 表格显示最近5条订单
   - "View All" 链接

【样式】
- Grid布局：2列（响应式）
- 卡片间距：20px
- 统计卡片带图标和颜色区分
```

---

### 提示词 3.2：动态代理购买页面

```
【创建动态代理购买页面UI】

页面位置：frontend/src/views/proxy/DynamicBuy.vue

UI设计要求：

【布局】
1. Header Card
   - 标题："Dynamic Residential Proxy"
   - 描述文字

2. Packages Grid（5个套餐卡片）
   - Grid布局：repeat(auto-fit, minmax(280px, 1fr))
   
   每个套餐卡片显示：
   - 套餐名称
   - 价格信息：
     * 年费（或"免费"/"请联系客服"）
     * 流量单价（$X.X/GB）
   - 功能列表（带图标）
   - 联系客服按钮（企业定制套餐）
   
   特殊标记：
   - "个人"套餐标记为"最受欢迎"（el-badge）
   - 悬停效果：上移+阴影增强

3. Help Section Card
   - 图标 + 标题 + 描述
   - "Contact Customer Service" 按钮

【套餐数据】
1. 现收现付：免费 + $5.0/GB
2. 个人：$150/365天 + $4.5/GB（最受欢迎）
3. 商务：$450/365天 + $4.0/GB
4. 高级：$1200/365天 + $3.6/GB
5. 企业定制："请联系客服商议"

【样式】
- 卡片悬停：transform: translateY(-4px)
- 最受欢迎套餐：border-color: $primary-color
- 价格大字体：32px，粗体，主色
```

---

## 📱 阶段4：计费相关页面

### 提示词 4.1：充值页面

```
【创建钱包充值页面UI】

页面位置：frontend/src/views/wallet/Recharge.vue

UI设计要求：

【布局】
1. Recharge Form Card
   - 充值金额输入（InputNumber，步长10）
   - 实时CNY换算显示（汇率7.2）
   - 支付方式选择（Radio Group）：
     * 支付宝
     * 微信支付
     * 银行转账
   - 备注输入（Textarea）
   - 提交按钮

2. Recharge History Card
   - 标题："Recharge History"
   - 表格显示：
     * 订单号
     * 金额
     * 支付方式
     * 状态（待审核/已批准/已拒绝）
     * 创建时间
     * 备注
   - 分页

【样式】
- Form卡片：max-width: 600px
- CNY换算文字：灰色，小字体
- 状态标签颜色区分
```

---

### 提示词 4.2：订单和交易记录页面

```
【创建订单和交易记录页面UI】

1. 订单页面：frontend/src/views/order/Orders.vue
   - 筛选表单（状态、类型）
   - 订单表格：
     * 订单号
     * 订单类型
     * 金额
     * 状态（标签）
     * 创建时间
     * 备注
     * 操作（查看详情、取消订单）
   - 分页

2. 交易记录页面：frontend/src/views/billing/Transactions.vue
   - 筛选表单（交易类型）
   - 交易表格：
     * 交易号
     * 类型（标签）
     * 金额（+绿色/-红色）
     * 交易前余额
     * 交易后余额
     * 时间
     * 备注
   - 分页

【样式】
- 金额颜色：正数绿色，负数红色
- 表格紧凑布局
- 状态标签统一风格
```

---

## 🔧 阶段5：管理后台UI（如果需要）

### 提示词 5.1：管理后台布局

```
【创建管理后台布局】

布局位置：frontend/src/layouts/AdminLayout.vue

UI设计要求：

【结构】
- 左侧菜单（固定宽度200px，深蓝黑背景 #001529）
- 右侧内容区（白色背景）

【左侧菜单】
- Logo + 标题（顶部）
- 菜单项（6个）：
  1. 用户管理（el-icon: User）
  2. 充值审核（el-icon: Money）
  3. 订单管理（el-icon: Document）
  4. IP管理（el-icon: Connection）
  5. 数据统计（el-icon: DataLine）
  6. 系统设置（el-icon: Setting）

【右侧内容区】
- 顶部导航栏（面包屑 + 用户信息）
- 主内容区（<router-view />）

【样式】
- 左侧菜单：
  * 深蓝黑背景 #001529
  * 菜单项hover: rgba(255, 255, 255, 0.1)
  * 选中项: $primary-color
- 右侧内容：
  * 白色背景
  * Padding: 20px
```

---

### 提示词 5.2：管理后台页面

```
【创建管理后台各页面UI】

根据 design.md 第3.8节的API设计，创建以下页面：

1. 用户管理（frontend/src/views/admin/Users.vue）
   - 搜索表单
   - 用户表格（邮箱、角色、余额、状态、注册时间）
   - 操作：编辑、启用/停用、删除

2. 充值审核（frontend/src/views/admin/RechargeApproval.vue）
   - 筛选表单（状态）
   - 充值表格
   - 操作：批准、拒绝（带备注）

3. 订单管理（frontend/src/views/admin/Orders.vue）
   - 筛选表单
   - 订单表格
   - 导出CSV功能

4. IP管理（frontend/src/views/admin/IPManagement.vue）
   - 搜索筛选表单
   - IP表格
   - CSV导入功能
   - TXT导出功能

5. 数据统计（frontend/src/views/admin/Statistics.vue）
   - 统计卡片（8个）
   - ECharts图表（折线图 + 饼图）

6. 系统设置（frontend/src/views/admin/Settings.vue）
   - 表单布局
   - 分类设置：基础设置、交易设置、API配置

【样式统一要求】
- 白色卡片布局
- Element Plus 表格和表单
- 操作按钮右对齐
- 危险操作需要确认弹窗
```

---

## 🌍 阶段6：国际化

### 提示词 6.1：配置国际化

```
【配置vue-i18n国际化】

1. 创建语言文件：
   - frontend/src/locales/zh-CN.json
   - frontend/src/locales/en-US.json

2. 配置vue-i18n（frontend/src/main.ts）

3. 在DashboardLayout中添加语言切换器：
   - 右上角下拉菜单
   - 图标：el-icon: Globe
   - 选项：简体中文、English

4. 翻译所有静态文本：
   - 菜单
   - 按钮文字
   - 表单标签
   - 提示信息

【要求】
- 所有文本使用 $t('key.path')
- 语言偏好存储在 LocalStorage
- 切换语言时页面无需刷新
```

---

## ✅ 验收清单

完成所有提示词后，检查以下UI要点：

### 视觉一致性
- [ ] 所有页面使用统一的颜色方案
- [ ] 卡片样式一致（圆角8px，白色背景）
- [ ] 按钮样式统一
- [ ] 间距统一（16-20px）

### 组件功能
- [ ] FlagIcon 正确显示国旗
- [ ] PaymentPanel 购物车功能正常
- [ ] 表格选择和批量操作正常
- [ ] 表单验证正常

### 响应式
- [ ] PC端布局正常
- [ ] 移动端布局正常（上下布局）
- [ ] 平板端布局正常

### 交互体验
- [ ] 按钮悬停效果
- [ ] 表格行悬停高亮
- [ ] 加载状态正确显示
- [ ] 空状态友好提示

---

## 💡 使用技巧

### 1. 按顺序执行
- 必须先执行阶段1（样式系统 + FlagIcon）
- 然后执行阶段2（核心页面）
- 最后执行其他阶段

### 2. 分步验证
- 每完成一个提示词，立即验证UI效果
- 截图对比现有设计
- 发现问题立即修正

### 3. 引用现有文件
```
"请参考 frontend/src/views/proxy/StaticBuy.vue 的现有实现，
保持相同的布局和样式风格"
```

### 4. 强调细节
```
"特别注意：
1. 卡片圆角必须是8px
2. 主色必须是 #409EFF
3. 背景色必须是 #f5f7fa
4. 国旗图标必须使用 FlagIcon 组件"
```

---

**祝您成功复刻UI！** 🎨

---

**版本**: v1.0  
**创建日期**: 2025-10-31  
**作者**: ProxyHub Team

