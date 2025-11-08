# 🎯 我的开发习惯与工作流程

**最后更新**: 2025-11-07  
**用途**: 新项目快速上手参考

---

## 📋 目录

1. [沟通方式](#沟通方式)
2. [需求讨论](#需求讨论)
3. [UI设计](#ui设计)
4. [开发流程](#开发流程)
5. [测试验证](#测试验证)
6. [代码规范](#代码规范)
7. [Git工作流](#git工作流)
8. [文档管理](#文档管理)

---

## 💬 沟通方式

### 优先级
1. **口头沟通优先** - 逐步明确需求，避免文档和实际不符
2. **文档为辅** - 只记录重要配置步骤和关键决策
3. **从用户角度思考** - 体贴地思考用户需求，帮助理清思路

### 基本原则
- ✅ 不要问我是否开始执行，直接做
- ✅ 重要操作才写文档（如GitHub配置步骤）
- ✅ 不需要读文档，AI直接口头汇报即可
- ✅ 实际情况有很多因素，往往和文档内容不一样

---

## 🎨 需求讨论

### 流程
1. **先聊需求，不急着开发**
   - 把所有细节聊清楚
   - 确认UI设计
   - 确认功能优先级
   - 确认数据流向

2. **AI帮我理清需求**
   - 有时候我不太清楚自己的需求
   - AI从用户角度帮我捋清楚
   - 提出更符合用户体验的建议

3. **优先级排序**
   - AI来排序优先级
   - P0 > P1 > P2
   - 先做核心功能，再做优化

---

## 🎨 UI设计

### 设计习惯

**在开发每个功能前，先用文字描述UI**：

```
功能：充值申请
页面：账户充值

布局：
┌─────────────────────────────────────┐
│ 标题：账户充值                       │
├─────────────────────────────────────┤
│ 1. 选择充值金额（卡片式）             │
│    [$50] [$100] [$200] [$500]       │
│ 2. 或自定义金额                      │
│    [输入框] USD                      │
│ 3. 选择充值方式                      │
│    ⚪ 银行转账                       │
│    ⚪ 支付宝                         │
│ 4. 联系方式                          │
│    Telegram: @support1 | @support2  │
│ [提交充值申请]                       │
└─────────────────────────────────────┘

交互流程：
1. 用户选择或输入金额
2. 选择充值方式
3. 点击"提交充值申请"
4. 弹出提示"申请已提交，请联系客服"
5. 显示订单号和充值说明

数据流：
前端 → POST /api/v1/billing/recharge
      { amount: 100, method: 'alipay' }
后端 → 创建充值订单
      → 返回订单详情
前端 → 显示订单信息和联系方式
```

### UI设计要点
- 📝 用文字详细描述布局、交互、流程
- 🎯 先确认设计，再开始开发
- 💬 口头沟通为主，文档为辅

### 配色方案（深色主题）

**主色调**：
- 背景色：`#0d0d0d` （最深）
- 卡片背景：`#1a1a1a`
- 次级背景：`#2d2d2d`
- 边框：`#3d3d3d`

**强调色**：
- 主要按钮：`#4a9eff` （蓝色）
- 成功状态：`#52c41a` （绿色）
- 警告状态：`#faad14` （橙色）
- 危险状态：`#ff4d4f` （红色）

**文字颜色**：
- 主文字：`#e6e6e6`
- 次要文字：`#8c8c8c`
- 禁用文字：`#595959`

### 响应式设计
- 手机端（< 768px）：卡片式布局，汉堡菜单
- PC端（>= 768px）：表格布局，侧边栏菜单
- **性能影响：0%**（纯CSS实现）

---

## 🔧 开发流程

### 1. 需求分析阶段
- 先聊需求，不着急开发
- 确认所有功能细节
- 确认UI设计
- 确认数据来源
- 确认优先级

### 2. 设计阶段
- 使用文字描述UI设计
- 确认交互流程
- 确认数据流向
- 确认API接口

### 3. 开发阶段
- 按优先级执行：P0 → P1 → P2
- 后端优先：先确保数据正确
- 前端跟进：UI实现和交互
- **确保所有数据都是真实的，没有Mock数据**

### 4. 验证阶段（重要！）
功能开发完整后，**必须用 Chrome DevTools 验证**：

**验证清单**：
- [ ] 打开 Chrome DevTools (F12)
- [ ] 切换到 Network 面板
- [ ] 执行功能操作（如购买IP）
- [ ] 检查 API 请求和响应：
  - ✅ 请求参数正确
  - ✅ 响应状态码 200/201
  - ✅ 响应数据格式正确
- [ ] 切换到 Console 面板
  - ✅ 无错误（Error）
  - ✅ 无警告（Warning，可忽略非关键警告）
- [ ] 切换到 Application 面板
  - ✅ LocalStorage/Token 正确
  - ✅ Cookie 正确（如有）
- [ ] 对比真实数据源（如985Proxy官网）
  - ✅ IP地址一致
  - ✅ 到期时间一致
  - ✅ 国家城市一致
  - ✅ 所有信息100%匹配

**验证完成后才算功能完成！**

---

## 📝 代码规范

### 通用规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- Git 提交遵循 Conventional Commits

### 命名规范
- 变量/函数：`camelCase`
- 类/接口：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`
- 文件名：`kebab-case.ts`

### 注释规范
```typescript
/**
 * 购买静态代理IP
 * @param userId - 用户ID
 * @param dto - 购买参数
 * @returns 订单详情和分配的IP列表
 */
async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
  // ...
}
```

### Mock数据规范
- ❌ **生产环境严禁使用Mock数据**
- ✅ 所有数据必须来自真实API或数据库
- ✅ 测试模式可以用Mock，但必须明确标记：`[MOCK]`
- ✅ 有环境变量控制：`PROXY_985_TEST_MODE=false`

---

## 🔄 Git 工作流

### 提交规范
```bash
# 格式
<type>(<scope>): <subject>

# 示例
feat(static-proxy): add order_result API integration
fix(purchase): resolve IP data inconsistency bug
docs: update development habits guide
```

**Type 类型**：
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

### Git Hooks
- **Pre-commit**：检查敏感文件、文件大小
- **Pre-push**：报告当前分支（已移除确认步骤）

### 自动部署
- Push到 `master` 分支 → GitHub Actions自动部署到腾讯云
- 不需要手动SSH到服务器
- 部署日志在GitHub Actions查看

---

## 📚 文档管理

### 文档存放规则
- 所有文档放在 `docs/` 目录
- 中文文件名允许，但不推荐（我可能手动删除）
- 按类型分类：
  - `docs/reports/` - 报告和总结
  - `docs/guides/` - 使用指南
  - `docs/api/` - API文档

### 文档更新原则
- 只记录重要配置步骤
- 口头汇报为主，文档为辅
- 文档内容可能过时，以实际为准

---

## 🎯 用户体验关注点

### 站在用户角度思考
1. **清晰度**：用户能立刻明白这个页面是干什么的吗？
2. **简单性**：操作步骤是否简单直接？
3. **反馈性**：用户操作后有明确反馈吗？
4. **容错性**：用户操作错误时，系统友好提示了吗？
5. **效率性**：用户能快速完成任务吗？

### 高端客户服务体验
- 提前创建好账户
- 充值好余额
- 发送欢迎邮件
- 客户登录即可使用
- 感受到"尊贵"和"贴心"

---

## 🚀 新项目快速上手流程

### 1. 项目初始化
```bash
# 克隆项目
git clone <repo-url>
cd <project>

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写配置

# 启动开发服务器
npm run dev
```

### 2. 理解项目结构
```
project/
├── backend/           # 后端（NestJS）
├── frontend/          # 前端（Vue 3）
├── docs/              # 文档
├── .github/           # GitHub Actions
├── docker-compose.yml # Docker配置
└── README.md         # 项目说明
```

### 3. 阅读关键文档
- `README.md` - 项目概览
- `MY-DEV-HABITS.md` - 开发习惯（本文档）
- `docs/PROJECT-GUIDE.md` - 项目方向和开发习惯

### 4. 配置开发工具
- VS Code + Volar + ESLint + Prettier
- Chrome DevTools
- Git Hooks (Husky)

### 5. 开始开发
1. 先聊需求
2. 设计UI（文字描述）
3. 开发功能
4. Chrome DevTools验证
5. 提交代码

---

## 📖 参考资料

### 技术栈文档
- [NestJS Documentation](https://docs.nestjs.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 最佳实践
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 🔄 持续更新

这个文档会随着项目进展不断更新：
- 添加新的开发习惯
- 优化工作流程
- 记录常见问题和解决方案
- 添加最佳实践案例

---

**记住**: 
- 口头沟通 > 文档
- 用户体验 > 技术实现
- 真实数据 > Mock数据
- Chrome DevTools验证 > 主观判断

**新项目第一件事**：
1. 复制这个文档到新项目
2. 根据新项目特点调整
3. 开始愉快地开发！🚀

