# ProxyHub系统调试与修复 - 任务清单

## Phase 1: 后端核心修复 🔧

### Task 1.1: 配置Swagger API文档
**状态**: [ ] 待处理  
**优先级**: P0  
**预计时间**: 15分钟

**描述**:
在backend/src/main.ts中配置Swagger文档，使其可以通过 http://localhost:3000/api 访问。

**文件**:
- `backend/src/main.ts`

**实现步骤**:
1. 导入必要的Swagger模块
2. 创建Swagger配置对象（DocumentBuilder）
3. 添加API标签分组
4. 添加Bearer Auth支持
5. 配置Swagger UI路径为 `/api`
6. 添加启动日志输出

**验收标准**:
- [ ] 访问 http://localhost:3000/api 显示Swagger UI
- [ ] Swagger UI显示所有API端点
- [ ] 可以展开查看API详情
- [ ] 显示Bearer Auth授权按钮

###Task 1.2: 运行并验证数据库种子数据
**状态**: [ ] 待处理  
**优先级**: P0  
**预计时间**: 10分钟

**描述**:
运行种子数据脚本，确保数据库中有测试账号。

**文件**:
- `backend/src/database/seeds/initial-seed.ts`

**实现步骤**:
1. 停止当前后端服务
2. 运行种子数据脚本: `cd backend && npm run seed`
3. 检查控制台输出，确认数据创建成功
4. 使用psql或数据库工具验证users表中有数据
5. 重新启动后端服务

**验收标准**:
- [ ] 脚本执行成功，无错误
- [ ] users表中有2条记录（user@example.com和admin@example.com）
- [ ] 密码已正确加密（bcrypt）
- [ ] 用户余额设置正确

### Task 1.3: 测试后端登录API
**状态**: [ ] 待处理  
**优先级**: P0  
**预计时间**: 10分钟

**描述**:
使用curl或Swagger测试登录API，确保后端逻辑正常。

**测试命令**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**验收标准**:
- [ ] API返回200状态码
- [ ] 响应包含access_token
- [ ] 响应包含用户信息
- [ ] Token可以用于后续认证请求

---

## Phase 2: 前端调试与修复 🎨

### Task 2.1: 添加前端调试日志
**状态**: [ ] 待处理  
**优先级**: P0  
**预计时间**: 15分钟

**描述**:
在关键位置添加console.log调试日志，帮助定位登录问题。

**文件**:
- `frontend/src/views/auth/Login.vue`
- `frontend/src/stores/user.ts`
- `frontend/src/api/request.ts`

**实现步骤**:
1. 在Login.vue的handleLogin方法中添加日志
2. 在user.ts的userLogin方法中添加日志
3. 在request.ts的拦截器中添加日志
4. 确保日志输出清晰，包含关键参数

**验收标准**:
- [ ] 点击登录按钮时Console显示"[Login] 开始登录"
- [ ] 显示发送的请求参数
- [ ] 显示API响应数据
- [ ] 显示token保存状态

### Task 2.2: 验证前端API请求配置
**状态**: [ ] 待处理  
**优先级**: P0  
**预计时间**: 10分钟

**描述**:
检查并修复前端API请求配置，确保请求能够正确发送到后端。

**文件**:
- `frontend/src/api/request.ts`
- `frontend/vite.config.ts`

**检查项**:
1. baseURL是否设置为 `/api/v1`
2. Vite proxy配置是否正确
3. CORS是否配置
4. Axios拦截器是否正确处理响应

**验收标准**:
- [ ] baseURL配置正确
- [ ] proxy配置正确转发到后端
- [ ] 请求可以成功发送
- [ ] 响应可以正确解析

### Task 2.3: 修复登录逻辑（如果需要）
**状态**: [ ] 待处理  
**优先级**: P1  
**预计时间**: 20分钟

**描述**:
根据调试日志，修复前端登录流程中的问题。

**可能的问题和修复**:
1. **handleLogin未触发**: 检查按钮绑定
2. **API请求未发送**: 检查Axios配置
3. **响应处理错误**: 检查store逻辑
4. **路由跳转失败**: 检查router配置

**验收标准**:
- [ ] 点击登录按钮触发handleLogin
- [ ] API请求成功发送
- [ ] Token正确保存到localStorage
- [ ] 用户信息保存到store
- [ ] 成功跳转到dashboard

---

## Phase 3: 端到端测试 ✅

### Task 3.1: Chrome DevTools完整测试
**状态**: [ ] 待处理  
**优先级**: P0  
**预计时间**: 30分钟

**描述**:
使用Chrome DevTools进行完整的端到端测试，验证所有核心功能。

**测试场景**:

1. **登录测试**:
   - 打开 http://localhost:8080/login
   - F12打开DevTools
   - 切换到Network标签
   - 输入user@example.com / password123
   - 点击登录
   - 验证: 看到POST /api/v1/auth/login请求
   - 验证: Response返回token
   - 验证: 跳转到/dashboard

2. **仪表盘测试**:
   - 验证: GET /api/v1/dashboard/overview请求
   - 验证: 显示用户信息
   - 验证: 显示统计数据

3. **代理购买测试**:
   - 进入静态住宅选购页面
   - 填写购买信息（US/New York, 2个IP, 30天）
   - 点击购买
   - 验证: POST /api/v1/proxy/static/purchase请求
   - 验证: 余额扣减
   - 验证: 订单创建

4. **充值测试**:
   - 提交充值申请（$100）
   - 验证: POST /api/v1/billing/recharge请求
   - 验证: 充值记录创建

5. **管理员测试**:
   - 退出登录
   - 使用admin@example.com / admin123登录
   - 进入管理后台
   - 审批充值申请
   - 验证: PUT /api/v1/billing/recharge/:id/approve请求
   - 验证: 用户余额增加

**验收标准**:
- [ ] 所有测试场景通过
- [ ] 无Console错误
- [ ] 所有API请求成功（200状态码）
- [ ] 数据正确显示和更新

### Task 3.2: 创建测试报告
**状态**: [ ] 待处理  
**优先级**: P1  
**预计时间**: 15分钟

**描述**:
整理测试结果，创建详细的测试报告。

**报告内容**:
1. 测试环境信息
2. 测试执行时间
3. 测试结果（通过/失败）
4. Chrome DevTools截图
5. 发现的问题和解决方案
6. 性能指标（API响应时间）

**交付物**:
- `TEST_REPORT.md`
- Chrome DevTools截图文件

**验收标准**:
- [ ] 报告包含所有必要信息
- [ ] 截图清晰，标注明确
- [ ] 问题描述清楚
- [ ] 性能数据准确

---

## Phase 4: 文档与交付 📝

### Task 4.1: 更新故障排查文档
**状态**: [ ] 待处理  
**优先级**: P2  
**预计时间**: 20分钟

**描述**:
基于本次调试经验，更新故障排查文档。

**文件**:
- `TROUBLESHOOTING.md` (新建)
- `README.md` (更新)
- `ACCEPTANCE_TEST.md` (更新)

**内容**:
1. 常见问题和解决方案
2. 调试步骤和工具使用
3. Chrome DevTools使用指南
4. 日志查看和分析方法

**验收标准**:
- [ ] 文档完整，易于理解
- [ ] 包含实际案例和截图
- [ ] 提供清晰的操作步骤

### Task 4.2: 提交代码到GitHub
**状态**: [ ] 待处理  
**优先级**: P1  
**预计时间**: 5分钟

**描述**:
将所有修复提交到GitHub，确保代码可追溯。

**提交消息**:
```
fix: 修复后端Swagger配置和登录问题

- 配置Swagger API文档
- 运行数据库种子数据
- 添加前端调试日志
- 修复登录流程
- 完成端到端测试

Issue: #1
```

**验收标准**:
- [ ] 所有修改已提交
- [ ] 提交消息清晰
- [ ] 代码已推送到远程仓库
- [ ] 无冲突

### Task 4.3: 最终验收测试
**状态**: [ ] 待处理  
**优先级**: P0  
**预计时间**: 30分钟

**描述**:
执行完整的验收测试，确保系统可以交付。

**测试检查清单**:
- [ ] 用户可以成功注册
- [ ] 用户可以成功登录
- [ ] 仪表盘数据正确显示
- [ ] 可以购买静态代理
- [ ] 可以提交充值申请
- [ ] 管理员可以审批充值
- [ ] 可以查看订单列表
- [ ] 可以查看交易记录
- [ ] 可以修改个人信息
- [ ] 可以修改密码
- [ ] Swagger文档可以访问
- [ ] 所有API端点可用

**性能检查**:
- [ ] API响应时间 < 500ms
- [ ] 登录过程 < 2秒
- [ ] 页面加载 < 3秒

**验收标准**:
- [ ] 所有功能测试通过
- [ ] 性能达标
- [ ] 无阻塞性bug
- [ ] 用户体验良好

---

## 任务依赖关系

```
Task 1.1 (Swagger配置)
    ↓
Task 1.2 (种子数据)
    ↓
Task 1.3 (测试登录API)
    ↓
Task 2.1 (添加调试日志)
    ↓
Task 2.2 (验证API配置)
    ↓
Task 2.3 (修复登录逻辑)
    ↓
Task 3.1 (完整测试)
    ↓
Task 3.2 (测试报告)
    ↓
Task 4.1 (更新文档)
    ↓
Task 4.2 (提交代码)
    ↓
Task 4.3 (最终验收)
```

## 总预计时间: 约3小时

## 关键里程碑

1. **Phase 1完成**: 后端可用，API可测试 ✅
2. **Phase 2完成**: 前端登录成功 ✅
3. **Phase 3完成**: 所有功能验证通过 ✅
4. **Phase 4完成**: 系统可交付 ✅

---

**状态**: 准备实施  
**创建时间**: 2025-11-02  
**负责人**: AI开发助手  
**优先级**: P0（紧急）

