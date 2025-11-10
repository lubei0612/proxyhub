# UI修复和API改进 - 任务列表

## 任务概览
- **总任务数：** 15
- **预估工时：** 12-15小时
- **优先级分布：** P0(6), P1(9)

---

## Phase 1: P0 - 关键API修复

### Task 1.1: 修复985Proxy API连接
**优先级：** P0  
**预估时间：** 1小时  
**依赖：** 无

**子任务：**
- [ ] 1.1.1 验证`.env`文件中的API KEY配置
- [ ] 1.1.2 修复`Proxy985Service.getBusinessList()`方法（移除重复定义）
- [ ] 1.1.3 添加API调用日志记录
- [ ] 1.1.4 实现API错误重试机制（最多3次）
- [ ] 1.1.5 添加API响应缓存（TTL: 1小时）

**验收标准：**
```bash
# 测试命令
curl -X GET http://localhost:3000/api/v1/proxy985/business-list \
  -H "Authorization: Bearer {token}"

# 预期响应
{
  "success": true,
  "data": [...]
}
```

---

### Task 1.2: 实现业务场景API端点
**优先级：** P0  
**预估时间：** 1小时  
**依赖：** Task 1.1

**子任务：**
- [ ] 1.2.1 创建`GET /api/v1/proxy985/business-list`端点
- [ ] 1.2.2 实现`Proxy985Controller.getBusinessList()`方法
- [ ] 1.2.3 添加JWT认证守卫
- [ ] 1.2.4 添加响应数据转换
- [ ] 1.2.5 编写单元测试

**实现文件：**
- `backend/src/modules/proxy985/proxy985.controller.ts`
- `backend/src/modules/proxy985/proxy985.service.ts`

---

### Task 1.3: 前端集成业务场景选择器
**优先级：** P0  
**预估时间：** 1.5小时  
**依赖：** Task 1.2

**子任务：**
- [ ] 1.3.1 在`proxy985.ts` API模块添加`getBusinessList()`方法
- [ ] 1.3.2 在`StaticBuy.vue`页面添加业务场景下拉框
- [ ] 1.3.3 实现业务场景加载逻辑
- [ ] 1.3.4 更新`getInventory()`调用，传递`businessScenario`参数
- [ ] 1.3.5 添加加载状态和错误处理

**UI位置：**
```
静态住宅选购页面
  └── 筛选区域
      ├── IP类型选择
      ├── 套餐时长选择
      └── 业务场景选择 ⬅️ 新增
```

---

### Task 1.4: 创建用户级IP池API端点
**优先级：** P0  
**预估时间：** 2小时  
**依赖：** 数据库迁移（已完成）

**子任务：**
- [ ] 1.4.1 实现`PricingService.getUserIpPoolForPriceOverride(userId)`
- [ ] 1.4.2 创建`GET /api/v1/price/user-ip-pool/:userId`端点
- [ ] 1.4.3 添加管理员权限检查（RolesGuard）
- [ ] 1.4.4 实现数据聚合逻辑（全局覆盖 + 用户覆盖）
- [ ] 1.4.5 添加数据缓存策略
- [ ] 1.4.6 编写集成测试

**响应数据结构：**
```typescript
interface UserIpPoolItem {
  country: string;
  city: string;
  ipType: string;
  originalPrice: number;
  globalOverridePrice: number | null;
  userOverridePrice: number | null;
  currentPrice: number;
  hasUserOverride: boolean;
}
```

---

### Task 1.5: 创建批量更新价格覆盖API
**优先级：** P0  
**预估时间：** 2小时  
**依赖：** Task 1.4

**子任务：**
- [ ] 1.5.1 实现`PricingService.batchUpdateUserPriceOverrides(userId, updates)`
- [ ] 1.5.2 创建`POST /api/v1/price/user-overrides/:userId/batch`端点
- [ ] 1.5.3 添加数据验证（价格范围、必填字段）
- [ ] 1.5.4 实现事务处理（全部成功或全部回滚）
- [ ] 1.5.5 添加操作日志记录
- [ ] 1.5.6 清除相关缓存
- [ ] 1.5.7 编写单元测试和集成测试

**请求示例：**
```json
{
  "updates": [
    {
      "country": "美国",
      "city": "洛杉矶",
      "ipType": "shared",
      "overridePrice": 4.99
    },
    {
      "country": "日本",
      "city": "东京",
      "ipType": "premium",
      "overridePrice": null  // 删除覆盖
    }
  ]
}
```

---

### Task 1.6: 前端价格覆盖对话框集成
**优先级：** P0  
**预估时间：** 2.5小时  
**依赖：** Task 1.5

**子任务：**
- [ ] 1.6.1 在`admin.ts` API模块添加`getUserIpPool()`和`updateUserPriceOverrides()`
- [ ] 1.6.2 在`Users.vue`添加"价格覆盖"按钮
- [ ] 1.6.3 创建`UserPriceOverrideModal.vue`组件
- [ ] 1.6.4 实现IP池数据加载和表格展示
- [ ] 1.6.5 实现价格编辑功能（可编辑输入框）
- [ ] 1.6.6 实现批量保存逻辑
- [ ] 1.6.7 添加变更检测（只提交修改过的数据）
- [ ] 1.6.8 添加加载状态、错误提示、成功反馈
- [ ] 1.6.9 测试完整流程

**UI位置：**
```
用户管理页面
  └── 操作列
      ├── 编辑
      ├── 删除
      └── 价格覆盖 ⬅️ 新增
          └── 打开对话框
              └── 显示用户IP池 + 价格编辑
```

---

## Phase 2: P1 - UI/UX改进

### Task 2.1: 重构账户中心页面布局
**优先级：** P1  
**预估时间：** 3小时  
**依赖：** 无

**子任务：**
- [ ] 2.1.1 创建左右分栏布局结构
- [ ] 2.1.2 实现左侧账户信息卡片
  - [ ] 登录密码卡片
  - [ ] 邮箱绑定卡片
  - [ ] 通知设置卡片
- [ ] 2.1.3 实现右侧快捷操作卡片
  - [ ] 订购静态IP
  - [ ] 动态代理管理
  - [ ] 静态IP管理
  - [ ] 查看订单
- [ ] 2.1.4 实现右侧联系客服卡片
  - [ ] 在线客服信息
  - [ ] 工作时间显示
  - [ ] 平均响应时间
- [ ] 2.1.5 添加响应式样式（移动端上下布局）
- [ ] 2.1.6 添加交互动画和过渡效果
- [ ] 2.1.7 多设备测试（桌面、平板、手机）

**文件路径：**
- `frontend/src/views/account/AccountCenter.vue`

---

### Task 2.2: 修复仪表盘统计卡片渲染
**优先级：** P1  
**预估时间：** 1小时  
**依赖：** 无

**子任务：**
- [ ] 2.2.1 检查`Dashboard.vue`中的`el-col` span值总和
- [ ] 2.2.2 修正卡片宽度计算（确保总和=24）
- [ ] 2.2.3 调整卡片间距（gutter）
- [ ] 2.2.4 优化卡片内部布局（图标+文字对齐）
- [ ] 2.2.5 添加响应式断点
  - 桌面端：4列（每列span=6）
  - 手机端：2列（每列span=12）
- [ ] 2.2.6 测试不同屏幕尺寸

**修复前：**
```vue
<!-- 错误：span总和超过24 -->
<el-col :span="6">...</el-col>
<el-col :span="6">...</el-col>
<el-col :span="6">...</el-col>
<el-col :span="8">...</el-col> <!-- ❌ 总和=26 -->
```

**修复后：**
```vue
<el-col :xs="12" :sm="12" :md="6" :lg="6">...</el-col>
<el-col :xs="12" :sm="12" :md="6" :lg="6">...</el-col>
<el-col :xs="12" :sm="12" :md="6" :lg="6">...</el-col>
<el-col :xs="12" :sm="12" :md="6" :lg="6">...</el-col> <!-- ✅ 总和=24 -->
```

---

### Task 2.3: 实现待处理事项数据动态化
**优先级：** P1  
**预估时间：** 2小时  
**依赖：** 无

**子任务：**
- [ ] 2.3.1 创建`StatsService.getAdminPendingTasks()`方法
- [ ] 2.3.2 实现数据库查询逻辑
  - [ ] 查询待审核充值数量
  - [ ] 查询异常订单数量
  - [ ] 查询未读系统通知数量
- [ ] 2.3.3 创建`GET /api/v1/stats/admin-pending-tasks`端点
- [ ] 2.3.4 添加管理员权限检查
- [ ] 2.3.5 在前端创建`adminStore`
- [ ] 2.3.6 实现自动刷新机制（每60秒）
- [ ] 2.3.7 在管理后台侧边栏显示数字徽章
- [ ] 2.3.8 移除所有硬编码的"3"

**实现文件：**
- Backend: `backend/src/modules/stats/stats.service.ts`
- Backend: `backend/src/modules/stats/stats.controller.ts`
- Frontend: `frontend/src/stores/admin.ts`
- Frontend: `frontend/src/layouts/DashboardLayout.vue`

---

### Task 2.4: 完善价格覆盖页面响应式设计
**优先级：** P1  
**预估时间：** 1.5小时  
**依赖：** Task 1.6

**子任务：**
- [ ] 2.4.1 在`PriceOverrides.vue`添加移动端样式
- [ ] 2.4.2 表格在移动端支持横向滚动
- [ ] 2.4.3 筛选器在移动端堆叠显示
- [ ] 2.4.4 按钮在移动端全宽显示
- [ ] 2.4.5 对话框在移动端全屏显示
- [ ] 2.4.6 测试各个断点

**移动端样式：**
```scss
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    .el-select,
    .el-input {
      width: 100%;
      margin-bottom: 12px;
    }
  }

  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .el-button {
    width: 100%;
    min-height: 44px;
  }
}
```

---

### Task 2.5: 完善用户价格覆盖对话框响应式
**优先级：** P1  
**预估时间：** 1小时  
**依赖：** Task 1.6

**子任务：**
- [ ] 2.5.1 对话框在移动端自适应宽度（90%）
- [ ] 2.5.2 表格在移动端支持横向滚动
- [ ] 2.5.3 输入框在移动端尺寸合适
- [ ] 2.5.4 底部按钮在移动端堆叠显示
- [ ] 2.5.5 测试各个设备尺寸

---

### Task 2.6: 完善静态购买页面响应式设计
**优先级：** P1  
**预估时间：** 1小时  
**依赖：** Task 1.3

**子任务：**
- [ ] 2.6.1 筛选区域在移动端堆叠显示
- [ ] 2.6.2 IP库存卡片在移动端单列显示
- [ ] 2.6.3 购买按钮在移动端全宽显示
- [ ] 2.6.4 测试完整购买流程（移动端）

---

### Task 2.7: 账户中心移动端交互优化
**优先级：** P1  
**预估时间：** 1小时  
**依赖：** Task 2.1

**子任务：**
- [ ] 2.7.1 快捷操作按钮添加点击反馈
- [ ] 2.7.2 卡片添加阴影和圆角
- [ ] 2.7.3 图标和文字间距优化
- [ ] 2.7.4 添加骨架屏加载效果
- [ ] 2.7.5 测试触摸交互

---

### Task 2.8: 仪表盘图表移动端优化
**优先级：** P1  
**预估时间：** 1小时  
**依赖：** Task 2.2

**子任务：**
- [ ] 2.8.1 图表在移动端自适应容器宽度
- [ ] 2.8.2 图表支持触摸滚动
- [ ] 2.8.3 图表工具提示在移动端正确显示
- [ ] 2.8.4 统计卡片数字在移动端字号合适
- [ ] 2.8.5 测试横屏和竖屏模式

---

### Task 2.9: 全局样式规范统一
**优先级：** P1  
**预估时间：** 1.5小时  
**依赖：** 无

**子任务：**
- [ ] 2.9.1 创建响应式断点变量（SCSS）
- [ ] 2.9.2 创建移动端适配混合宏（mixin）
- [ ] 2.9.3 统一最小点击区域（44px）
- [ ] 2.9.4 统一最小字号（14px）
- [ ] 2.9.5 统一间距规范（8px倍数）
- [ ] 2.9.6 更新所有页面使用统一规范

**文件路径：**
- `frontend/src/styles/responsive.scss` (新建)
- `frontend/src/styles/variables.scss` (更新)

---

## Phase 3: 测试和验证

### Task 3.1: 编写单元测试
**优先级：** P1  
**预估时间：** 2小时  
**依赖：** Phase 1, Phase 2

**测试覆盖：**
- [ ] 3.1.1 `PricingService.getUserIpPoolForPriceOverride()`
- [ ] 3.1.2 `PricingService.batchUpdateUserPriceOverrides()`
- [ ] 3.1.3 `Proxy985Service.getBusinessList()`
- [ ] 3.1.4 `StatsService.getAdminPendingTasks()`
- [ ] 3.1.5 目标覆盖率：≥80%

---

### Task 3.2: 编写集成测试
**优先级：** P1  
**预估时间：** 1.5小时  
**依赖：** Phase 1, Phase 2

**测试场景：**
- [ ] 3.2.1 完整的用户价格覆盖流程
- [ ] 3.2.2 985Proxy API连接测试
- [ ] 3.2.3 待处理事项数据查询测试
- [ ] 3.2.4 业务场景加载和过滤测试

---

### Task 3.3: 多设备响应式测试
**优先级：** P1  
**预估时间：** 2小时  
**依赖：** Phase 2

**测试设备/尺寸：**
- [ ] 3.3.1 iPhone SE (375x667)
- [ ] 3.3.2 iPhone 12 Pro (390x844)
- [ ] 3.3.3 iPad (768x1024)
- [ ] 3.3.4 桌面 (1920x1080)
- [ ] 3.3.5 桌面 (2560x1440)

**测试页面：**
- [ ] 账户中心
- [ ] 仪表盘
- [ ] 用户管理
- [ ] 价格覆盖
- [ ] 静态代理购买

---

### Task 3.4: 用户验收测试
**优先级：** P1  
**预估时间：** 1小时  
**依赖：** Task 3.1, 3.2, 3.3

**验收清单：**
- [ ] 3.4.1 所有P0问题已修复并验证
- [ ] 3.4.2 所有P1问题已修复并验证
- [ ] 3.4.3 无新增bug或回归问题
- [ ] 3.4.4 性能指标达标
- [ ] 3.4.5 用户体验良好

---

## 任务执行顺序

```
Phase 1 (P0 - 关键修复)
├── Task 1.1 → Task 1.2 → Task 1.3
│   (985API连接 → 业务场景API → 前端集成)
│
└── Task 1.4 → Task 1.5 → Task 1.6
    (用户IP池API → 批量更新API → 前端价格覆盖)

Phase 2 (P1 - UI/UX)
├── Task 2.1 (账户中心重构)
├── Task 2.2 (仪表盘卡片修复)
├── Task 2.3 (待处理事项动态化)
├── Task 2.4-2.6 (响应式设计)
├── Task 2.7-2.8 (交互优化)
└── Task 2.9 (样式规范)

Phase 3 (测试验证)
└── Task 3.1 → Task 3.2 → Task 3.3 → Task 3.4
    (单元测试 → 集成测试 → 响应式测试 → 用户验收)
```

---

## 风险和注意事项

### 高风险任务
- **Task 1.1**: 985Proxy API可能不稳定，需要添加重试和降级机制
- **Task 1.5**: 批量更新需要事务处理，确保数据一致性
- **Task 2.3**: 查询逻辑复杂，注意性能优化

### 依赖关系
- Phase 2必须等待Phase 1完成
- Task 1.6依赖Task 1.4和1.5
- 所有响应式任务（2.4-2.8）依赖基础功能完成

### 时间缓冲
- 每个任务预留20%时间缓冲
- 复杂任务（如Task 2.1, 2.3）可能需要额外时间
- 测试阶段可能发现新问题，预留修复时间

---

**任务列表版本：** 1.0.0  
**创建日期：** 2025-11-10  
**最后更新：** 2025-11-10  
**状态：** 待开始

