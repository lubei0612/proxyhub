# ProxyHub系统调试与修复 - 设计文档

## 1. 设计概述

**规范名称**: system-debug-and-fix  
**版本**: 1.0.0  
**创建日期**: 2025-11-02  
**状态**: 设计中

### 1.1 设计目标
通过系统化的诊断和修复，解决ProxyHub当前的核心问题，确保系统可以正常运行和交付。

### 1.2 设计原则
1. **最小修改原则** - 只修复问题，不重构现有代码
2. **向后兼容** - 确保修复不影响现有功能
3. **可验证性** - 每个修复都有明确的验证方法
4. **文档完整** - 记录所有修改和原因

## 2. 问题诊断分析

### 2.1 问题根因分析

#### 问题1: Swagger文档404
**根因**: backend/src/main.ts中未配置Swagger

**证据**:
- 访问 http://localhost:3000/api 返回404
- Chrome DevTools显示: `{"message":"Cannot GET /api","error":"Not Found","statusCode":404}`

**影响范围**:
- 无法查看API文档
- 无法直接测试API
- 开发调试困难

#### 问题2: 用户登录无响应
**根因**: 需要进一步诊断，可能原因：
1. 前端登录逻辑有bug
2. 后端login API不可用
3. 数据库无测试账号
4. CORS配置问题

**证据**:
- Chrome DevTools未显示任何XHR/fetch请求
- 点击登录按钮后页面无变化
- Console无错误信息

**需要验证**:
- [ ] 前端handleLogin方法是否被调用
- [ ] Axios请求是否发送
- [ ] 后端API是否可访问
- [ ] 数据库是否有测试数据

#### 问题3: 数据库初始数据
**根因**: 种子数据脚本可能未运行

**需要验证**:
- [ ] 检查users表是否为空
- [ ] 检查种子数据脚本是否存在
- [ ] 验证脚本执行逻辑

## 3. 解决方案设计

### 3.1 架构级修复

#### 3.1.1 后端main.ts配置
```typescript
// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局路由前缀
  app.setGlobalPrefix('api/v1');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS配置
  app.enableCors({
    origin: ['http://localhost:8080'],
    credentials: true,
  });

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('ProxyHub API')
    .setDescription('代理IP管理平台API文档')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('Auth', '认证相关接口')
    .addTag('User', '用户相关接口')
    .addTag('Proxy', '代理相关接口')
    .addTag('Billing', '账单相关接口')
    .addTag('Order', '订单相关接口')
    .addTag('Admin', '管理员相关接口')
    .addTag('Dashboard', '仪表盘相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`
========================================
  ProxyHub Backend Started!
========================================
  API Server: http://localhost:3000
  API Docs:   http://localhost:3000/api
  Global Prefix: /api/v1
========================================
  `);
}
bootstrap();
```

**修改要点**:
1. 添加Swagger配置
2. 添加Bearer Auth支持
3. 添加API标签分组
4. 添加启动日志输出
5. 确保CORS配置正确

#### 3.1.2 数据库种子数据增强
```typescript
// backend/src/database/seeds/initial-seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🌱 开始播种数据...');

    // 清空现有数据（仅用于开发环境）
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await dataSource.query('TRUNCATE TABLE static_proxies CASCADE');
    await dataSource.query('TRUNCATE TABLE orders CASCADE');
    await dataSource.query('TRUNCATE TABLE transactions CASCADE');
    await dataSource.query('TRUNCATE TABLE recharges CASCADE');
    await dataSource.query('TRUNCATE TABLE system_settings CASCADE');
    console.log('✅ 已清空现有数据');

    // 创建用户
    const users = [
      {
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 10),
        nickname: '测试用户',
        role: 'user',
        balance: 1000.00,
        gift_balance: 0.00,
        status: 'active',
      },
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        nickname: '系统管理员',
        role: 'admin',
        balance: 10000.00,
        gift_balance: 0.00,
        status: 'active',
      },
    ];

    for (const user of users) {
      await dataSource.query(
        `INSERT INTO users (email, password, nickname, role, balance, gift_balance, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.email, user.password, user.nickname, user.role, user.balance, user.gift_balance, user.status]
      );
    }
    console.log('✅ 已创建用户账号');

    // 创建系统设置
    const settings = [
      { key: 'static_proxy_normal_price', value: '5.00' },
      { key: 'static_proxy_native_price', value: '8.00' },
      { key: 'dynamic_proxy_base_price', value: '10.00' },
    ];

    for (const setting of settings) {
      await dataSource.query(
        `INSERT INTO system_settings (key, value) VALUES ($1, $2)`,
        [setting.key, setting.value]
      );
    }
    console.log('✅ 已创建系统设置');

    console.log('🎉 数据播种完成！');
    console.log('\n测试账号:');
    console.log('  普通用户: user@example.com / password123');
    console.log('  管理员:   admin@example.com / admin123\n');

  } catch (error) {
    console.error('❌ 数据播种失败:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();
```

**修改要点**:
1. 添加数据清空逻辑（开发环境）
2. 确保密码正确加密
3. 创建测试账号和系统设置
4. 添加详细的日志输出

### 3.2 组件级修复

#### 3.2.1 前端Login组件诊断与修复

**可能的问题**:
1. handleLogin方法未正确绑定
2. API请求地址错误
3. 响应处理逻辑错误

**验证步骤**:
```typescript
// frontend/src/views/auth/Login.vue

const handleLogin = async () => {
  console.log('[Login] 开始登录', loginForm); // 调试日志

  if (!loginForm.email || !loginForm.password) {
    ElMessage.warning('请输入邮箱和密码');
    return;
  }

  loading.value = true;

  try {
    console.log('[Login] 调用userStore.userLogin'); // 调试日志
    const success = await userStore.userLogin({
      email: loginForm.email,
      password: loginForm.password,
    });

    console.log('[Login] 登录结果:', success); // 调试日志

    if (success) {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('[Login] 登录失败:', error); // 调试日志
  } finally {
    loading.value = false;
  }
};
```

#### 3.2.2 Axios请求拦截器增强

**添加调试日志**:
```typescript
// frontend/src/api/request.ts

request.interceptors.request.use(
  (config: any) => {
    console.log('[Request]', config.method?.toUpperCase(), config.url); // 调试日志

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Request Error]', error); // 调试日志
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    console.log('[Response]', response.config.url, response.status); // 调试日志
    const res = response.data;
    return res;
  },
  (error) => {
    console.error('[Response Error]', error.response?.status, error.message); // 调试日志
    ElMessage({
      message: error.response?.data?.message || error.message,
      type: 'error',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);
```

### 3.3 数据流程设计

#### 3.3.1 登录流程
```
用户输入账号密码
    ↓
点击登录按钮
    ↓
触发handleLogin()
    ↓
调用userStore.userLogin()
    ↓
发送POST /api/v1/auth/login
    ↓
后端验证账号密码
    ↓
返回{access_token, user}
    ↓
保存token到localStorage
    ↓
保存user到Pinia store
    ↓
跳转到/dashboard
```

#### 3.3.2 API认证流程
```
发送API请求
    ↓
Axios请求拦截器
    ↓
从localStorage读取token
    ↓
附加到Authorization header
    ↓
发送到后端
    ↓
后端JwtStrategy验证token
    ↓
返回用户信息或401错误
```

### 3.4 错误处理设计

#### 3.4.1 前端错误处理
```typescript
try {
  const response = await api.login(credentials);
  // 成功处理
} catch (error) {
  if (error.response) {
    // 后端返回错误
    switch (error.response.status) {
      case 401:
        ElMessage.error('账号或密码错误');
        break;
      case 403:
        ElMessage.error('账号已被禁用');
        break;
      case 500:
        ElMessage.error('服务器错误，请稍后重试');
        break;
      default:
        ElMessage.error(error.response.data?.message || '登录失败');
    }
  } else if (error.request) {
    // 请求发送但无响应
    ElMessage.error('网络错误，请检查后端服务');
  } else {
    // 请求配置错误
    ElMessage.error('请求配置错误');
  }
}
```

#### 3.4.2 后端错误处理
```typescript
// 全局异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    console.error('[Exception]', status, message, exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## 4. 测试计划

### 4.1 单元测试
- [ ] 测试密码加密/验证
- [ ] 测试JWT token生成/验证
- [ ] 测试Pinia store登录逻辑

### 4.2 集成测试
- [ ] 测试登录API端到端流程
- [ ] 测试仪表盘数据获取
- [ ] 测试代理购买流程
- [ ] 测试充值审批流程

### 4.3 手动测试检查清单

#### 后端测试
```bash
# 1. 测试Swagger文档
curl http://localhost:3000/api
# 预期: 返回HTML页面（Swagger UI）

# 2. 测试登录API
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
# 预期: 返回{"access_token":"xxx","user":{...}}

# 3. 测试认证API
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
# 预期: 返回用户信息

# 4. 测试仪表盘API
curl http://localhost:3000/api/v1/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
# 预期: 返回仪表盘数据
```

#### 前端测试
1. **登录测试**:
   - 打开 http://localhost:8080/login
   - 打开Chrome DevTools (F12)
   - 输入: user@example.com / password123
   - 点击登录
   - 检查Network: 应看到POST /api/v1/auth/login
   - 检查Console: 应看到调试日志
   - 验证: 成功跳转到 /dashboard

2. **仪表盘测试**:
   - 登录后自动进入仪表盘
   - 检查Network: 应看到GET /api/v1/dashboard/overview
   - 验证: 显示用户信息和统计数据

3. **购买代理测试**:
   - 进入静态住宅选购页面
   - 填写购买信息
   - 点击购买
   - 检查Network: 应看到POST /api/v1/proxy/static/purchase
   - 验证: 购买成功提示，余额扣减

## 5. 部署与回滚

### 5.1 部署步骤
```bash
# 1. 停止所有服务
.\停止ProxyHub.bat

# 2. 更新代码
git pull origin master

# 3. 重新安装依赖（如果package.json有变化）
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. 运行数据库迁移
cd backend && npm run migration:run && cd ..

# 5. 运行种子数据
cd backend && npm run seed && cd ..

# 6. 启动服务
.\启动ProxyHub.bat
```

### 5.2 回滚计划
```bash
# 如果修复失败，回滚到上一个版本
git reset --hard HEAD~1
git push origin master --force

# 重新启动服务
.\启动ProxyHub.bat
```

## 6. 性能优化

### 6.1 数据库优化
- 添加必要的索引
- 优化查询语句

### 6.2 前端优化
- 使用Pinia persist插件持久化store
- 优化API请求缓存

## 7. 安全考虑

### 7.1 JWT安全
- Token有效期: 15分钟
- Refresh token有效期: 7天
- 使用强密钥

### 7.2 密码安全
- 使用bcrypt加密
- Salt rounds: 10

### 7.3 CORS安全
- 仅允许 http://localhost:8080
- 生产环境使用域名白名单

## 8. 监控与日志

### 8.1 日志级别
- ERROR: 错误信息
- WARN: 警告信息
- INFO: 关键操作日志
- DEBUG: 调试信息

### 8.2 关键监控指标
- API响应时间
- 登录成功率
- 错误率
- 数据库连接状态

## 9. 文档更新

### 9.1 需要更新的文档
- [x] ACCEPTANCE_TEST.md - 添加调试步骤
- [x] README.md - 更新故障排查章节
- [ ] TROUBLESHOOTING.md - 创建专门的故障排查文档

### 9.2 新增文档
- [ ] DEBUG_GUIDE.md - 调试指南
- [ ] API_TEST_GUIDE.md - API测试指南

## 10. 成功标准

### 10.1 功能验证
- ✅ Swagger文档可以访问
- ✅ 用户可以成功登录
- ✅ 仪表盘数据正确显示
- ✅ 可以购买静态代理
- ✅ 管理员可以审批充值

### 10.2 性能验证
- ✅ API响应时间 < 500ms
- ✅ 登录过程 < 2秒
- ✅ 页面加载 < 3秒

### 10.3 稳定性验证
- ✅ 连续登录10次成功率100%
- ✅ 无内存泄漏
- ✅ 无未捕获异常

---

**状态**: 等待任务分解  
**最后更新**: 2025-11-02  
**审阅人**: 待定

