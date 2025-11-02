# 🔧 ProxyHub 后端代码参考

## 📋 概述

本文档详细说明ProxyHub后端的**所有关键实现**，包括数据库Entity、API Controllers、业务Services、以及关键的技术点。

使用此参考，AI可以精确复刻整个后端系统。

---

## 🗄️ 数据库Entity设计

### 1. User Entity (`user.entity.ts`)

**位置**: `backend/src/modules/user/entities/user.entity.ts`

**关键字段**:
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  email: string;

  @Column({ length: 255 })
  password: string;  // bcrypt hash

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;  // 'user' | 'agent' | 'admin'

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;  // 'active' | 'inactive' | 'banned'

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;  // 余额

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gift_balance: number;  // 赠送金额

  @Column({ name: 'api_key', unique: true, nullable: true })
  @Index()
  apiKey: string;

  @Column({ name: 'proxy_985_zone', nullable: true })
  proxy985Zone: string;  // 985Proxy通道标识

  @Column({ name: 'referral_code', unique: true, nullable: true })
  @Index()
  referralCode: string;

  @Column({ name: 'referred_by', nullable: true })
  referredBy: string;

  @Column({ name: 'is_agent', default: false })
  isAgent: boolean;

  @Column({ name: 'agent_commission_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  agentCommissionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission_balance: number;  // 可提现佣金

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**关键枚举**:
```typescript
export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}
```

**设计要点**:
- UUID作为主键，避免暴露用户数量
- balance使用decimal类型，精确到分
- 支持三种角色：普通用户、代理、管理员
- referralCode用于推荐系统
- proxy985Zone关联985Proxy API

---

### 2. StaticProxy Entity (`static-proxy.entity.ts`)

**位置**: `backend/src/modules/proxy/entities/static-proxy.entity.ts`

**关键字段**:
```typescript
@Entity('static_proxies')
export class StaticProxy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'proxy_985_id' })
  @Index()
  proxy985Id: number;  // 985Proxy的代理ID

  @Column()
  zone: string;  // 通道标识

  @Column({ name: 'purpose_web', nullable: true })
  purposeWeb: string;  // 使用场景

  @Column({ name: 'static_proxy_type' })
  staticProxyType: string;  // 'shared' 或 'premium'

  @Column()
  @Index()
  ip: string;

  @Column()
  port: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ name: 'country_code' })
  countryCode: string;  // 国家代码 (如 'US')

  @Column({ name: 'city_name' })
  cityName: string;

  @Column({ name: 'expire_time_utc', type: 'timestamp' })
  expireTimeUtc: Date;

  @Column({ name: 'release_time_utc', type: 'timestamp', nullable: true })
  releaseTimeUtc: Date;

  @Column({ type: 'enum', enum: ProxyStatus, default: ProxyStatus.ACTIVE })
  status: ProxyStatus;  // 'active' | 'expired' | 'released'

  @Column({ type: 'boolean', default: false })
  auto_renew: boolean;  // 是否自动续费

  @Column({ type: 'text', nullable: true })
  remark: string;  // 用户备注

  @Column({ name: 'order_no', nullable: true })
  @Index()
  orderNo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**关键枚举**:
```typescript
export enum ProxyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  RELEASED = 'released',
}
```

**设计要点**:
- 每个代理IP关联一个用户
- 保存完整的认证信息 (ip/port/username/password)
- 支持自动续费功能
- expireTimeUtc使用UTC时间，避免时区问题
- orderNo关联购买订单

---

### 3. Order Entity

**关键字段**:
```typescript
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_no', unique: true })
  @Index()
  orderNo: string;  // 订单号

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;  // 'buy' | 'renew'

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;  // 'pending' | 'completed' | 'failed' | 'cancelled'

  @Column({ name: 'proxy_type' })
  proxyType: string;  // 'res_static' | 'res_rotating' | 'mobile'

  @Column({ name: 'static_proxy_type', nullable: true })
  staticProxyType: string;  // 'shared' | 'premium'

  @Column({ name: 'purpose_web', nullable: true })
  purposeWeb: string;

  @Column({ name: 'time_period' })
  timePeriod: number;  // 天数

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ name: 'discount_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_price: number;

  @Column({ name: 'pay_price', type: 'decimal', precision: 10, scale: 2 })
  pay_price: number;  // 实付金额

  @Column({ name: 'buy_data', type: 'jsonb', nullable: true })
  buy_data: any;  // 购买详情（JSON）

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**关键枚举**:
```typescript
export enum OrderType {
  BUY = 'buy',
  RENEW = 'renew',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
```

---

## 🎛️ API Controllers实现

### 1. AuthController (`auth.controller.ts`)

**位置**: `backend/src/modules/auth/auth.controller.ts`

**API端点**:

#### POST /auth/register
```typescript
@Public()
@Post('register')
@HttpCode(HttpStatus.CREATED)
async register(@Body() registerDto: RegisterDto) {
  return this.authService.register(
    registerDto.email,
    registerDto.password,
    registerDto.referralCode,
  );
}
```

**响应格式**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "balance": "0.00",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### POST /auth/login
```typescript
@Public()
@UseGuards(LocalAuthGuard)
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Request() req, @Body() loginDto: LoginDto) {
  const ip = req.ip || req.connection.remoteAddress;
  return this.authService.login(req.user, ip);
}
```

**关键技术点**:
- `@Public()` 装饰器标记公开API，不需要JWT
- `LocalAuthGuard` 使用Passport验证email/password
- 登录成功后记录IP地址和时间
- 返回JWT access_token供后续API使用

---

### 2. ProxyController (`proxy.controller.ts`)

**位置**: `backend/src/modules/proxy/proxy.controller.ts`

**核心API端点**:

#### GET /proxy/static/inventory
```typescript
@Public()
@Get('static/inventory')
async getInventory(
  @Query('static_proxy_type') staticProxyType: string,
  @Query('purpose_web') purposeWeb?: string,
) {
  return this.proxyService.getInventoryWithMarkup(staticProxyType, purposeWeb);
}
```

**用途**: 获取可购买的IP库存，按国家/城市分组

**响应格式**:
```json
{
  "data": [
    {
      "country_code": "US",
      "country_name": "United States",
      "cities": [
        {
          "city_name": "New York",
          "available_count": 150,
          "price_per_day": 0.27
        }
      ]
    }
  ]
}
```

#### GET /proxy/static/my-proxies
```typescript
@Get('static/my-proxies')
async getMyProxies(
  @Request() req,
  @Query('zone') zone?: string,
  @Query('page') page = 1,
  @Query('limit') limit = 20,
) {
  // 从本地数据库获取用户的代理列表
  return this.proxyService.getUserProxies(
    req.user.id, 
    Number(page), 
    Number(limit)
  );
}
```

**用途**: 获取用户已购买的静态IP列表

**响应格式**:
```json
{
  "data": [
    {
      "id": "uuid",
      "ip": "192.168.1.100",
      "port": 8080,
      "username": "user123",
      "password": "pass456",
      "countryCode": "US",
      "cityName": "New York",
      "expireTimeUtc": "2025-12-31T23:59:59.000Z",
      "status": "active",
      "auto_renew": false,
      "remark": "My test proxy"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### POST /proxy/static/purchase
```typescript
@Post('static/purchase')
@HttpCode(HttpStatus.CREATED)
async purchaseStaticProxies(
  @Request() req,
  @Body() dto: PurchaseStaticProxyDto,
) {
  return this.proxyService.purchaseStaticProxy(req.user.id, dto);
}
```

**请求格式**:
```json
{
  "channelName": "My Channel",
  "scenario": "Social Media",
  "ipType": "native",
  "duration": 30,
  "items": [
    {
      "country": "US",
      "city": "New York",
      "quantity": 5
    },
    {
      "country": "UK",
      "city": "London",
      "quantity": 3
    }
  ]
}
```

**响应格式**:
```json
{
  "success": true,
  "message": "成功购买 8 个静态IP",
  "order": {
    "id": "uuid",
    "orderNo": "ORD-1234567890-ABC123",
    "totalPrice": 240.00,
    "totalQuantity": 8,
    "duration": 30
  },
  "allocatedIPs": [
    {
      "id": "uuid",
      "ip": "192.168.1.100",
      "port": 8080,
      "username": "user123",
      "password": "pass456",
      "country": "US",
      "city": "New York",
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
  ],
  "newBalance": "260.00"
}
```

#### PATCH /proxy/static/:id/auto-renew
```typescript
@Patch('static/:id/auto-renew')
async toggleAutoRenew(@Param('id') id: string, @Request() req) {
  return this.proxyService.toggleAutoRenew(id, req.user.id);
}
```

**用途**: 切换IP的自动续费开关

#### PATCH /proxy/static/:id/remark
```typescript
@Patch('static/:id/remark')
async updateRemark(
  @Param('id') id: string,
  @Request() req,
  @Body('remark') remark: string,
) {
  return this.proxyService.updateRemark(id, req.user.id, remark);
}
```

**用途**: 更新IP备注

---

## ⚙️ Service业务逻辑

### ProxyService核心方法

**位置**: `backend/src/modules/proxy/proxy.service.ts`

#### purchaseStaticProxy() - 购买静态IP

**这是整个系统最核心的业务逻辑！**

**关键技术点**:
1. **数据库事务** (TypeORM QueryRunner)
2. **余额验证**
3. **库存分配**
4. **订单记录**
5. **计费记录**

**完整流程**:
```typescript
async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
  // 1. 启动数据库事务
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 2. 验证用户余额
    const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
    const userBalance = parseFloat(user.balance);
    if (userBalance < totalPrice) {
      throw new BadRequestException('余额不足');
    }

    // 3. 分配IP（从库存中查找）
    for (const item of dto.items) {
      const availableIPs = await queryRunner.manager.find(StaticProxy, {
        where: {
          countryCode: item.country,
          cityName: item.city,
        },
        take: item.quantity,
      });

      // 检查库存
      if (availableIPs.length < item.quantity) {
        throw new BadRequestException('库存不足');
      }

      // 标记IP为已分配
      for (const ip of availableIPs) {
        ip.status = ProxyStatus.ACTIVE;
        ip.userId = userId;
        ip.orderNo = orderNo;
        ip.expireTimeUtc = new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000);
        await queryRunner.manager.save(StaticProxy, ip);
        allocatedIPs.push(ip);
      }
    }

    // 4. 创建订单记录
    const order = queryRunner.manager.create(Order, {
      orderNo,
      userId,
      type: OrderType.BUY,
      status: OrderStatus.COMPLETED,
      total_price: totalPrice,
      pay_price: totalPrice,
      // ... 其他字段
    });
    await queryRunner.manager.save(Order, order);

    // 5. 扣除用户余额
    user.balance = (userBalance - totalPrice).toFixed(2);
    await queryRunner.manager.save(User, user);

    // 6. 创建计费记录
    const billingDetail = queryRunner.manager.create(BillingDetail, {
      userId,
      category: 'expense',
      subCategory: 'static_proxy_purchase',
      amount: -totalPrice,  // 负数表示支出
      currency: 'USD',
      relatedId: order.id,
      relatedType: 'order',
      description: `购买静态住宅代理IP - ${dto.channelName}`,
    });
    await queryRunner.manager.save(BillingDetail, billingDetail);

    // 7. 提交事务
    await queryRunner.commitTransaction();

    return {
      success: true,
      message: `成功购买 ${totalQuantity} 个静态IP`,
      order: { ... },
      allocatedIPs: [ ... ],
      newBalance: user.balance,
    };

  } catch (error) {
    // 8. 出错回滚
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    // 9. 释放连接
    await queryRunner.release();
  }
}
```

**为什么使用事务？**
- 确保所有操作要么全部成功，要么全部失败
- 防止：扣了钱但没分配IP
- 防止：分配了IP但没扣钱
- 防止：创建了订单但没记录计费

---

## 🔐 认证授权

### JWT Strategy

**位置**: `backend/src/modules/auth/strategies/jwt.strategy.ts`

**关键实现**:
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

### Local Strategy (登录验证)

**位置**: `backend/src/modules/auth/strategies/local.strategy.ts`

**关键实现**:
```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return user;
  }
}
```

### 密码加密

**使用bcrypt**:
```typescript
import * as bcrypt from 'bcrypt';

// 注册时加密
const hashedPassword = await bcrypt.hash(password, 10);

// 登录时验证
const isMatch = await bcrypt.compare(password, user.password);
```

---

## 🌐 对外API集成

### 985Proxy API Service

**位置**: `backend/src/modules/proxy/services/proxy-985.service.ts`

**用途**: 调用985Proxy的开放API获取真实IP

**关键方法**:
```typescript
@Injectable()
export class Proxy985Service {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  async getStaticInventory(params) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.apiBaseUrl}/static-residential/inventory`, {
        params,
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
    );
    return response.data;
  }

  async purchaseStaticProxy(params) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.apiBaseUrl}/static-residential/buy`, params, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
    );
    return response.data;
  }
}
```

---

## 📊 数据库迁移

### TypeORM配置

**位置**: `backend/src/config/typeorm.config.ts`

```typescript
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,  // 生产环境必须为false
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  migrationsRun: true,
};
```

---

## ✅ 关键开发规范

### 1. API响应格式统一

**成功响应**:
```json
{
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**:
```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

### 2. 错误处理

```typescript
// 使用NestJS内置异常
throw new BadRequestException('参数错误');
throw new NotFoundException('资源不存在');
throw new UnauthorizedException('未授权');
throw new ForbiddenException('无权限');
```

### 3. 日志记录

```typescript
private readonly logger = new Logger(ServiceName.name);

this.logger.log(`[Action] Info message`);
this.logger.error(`[Action] Error: ${error.message}`);
this.logger.warn(`[Action] Warning message`);
```

### 4. 环境变量

必需的环境变量 (`.env`):
```env
# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=proxyhub

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# 985Proxy API
PROXY_985_API_BASE_URL=https://api.985proxy.com/api
PROXY_985_API_KEY=your-api-key-here

# 服务端口
PORT=3000
```

---

## 🎯 复刻要点总结

### 必须遵循的关键点：

1. **Entity设计**
   - 所有金额字段使用 `decimal(10,2)`
   - 所有时间字段使用UTC时间
   - 主键统一使用UUID
   - 必要字段添加 `@Index()`

2. **事务处理**
   - 涉及金钱/库存的操作必须使用事务
   - 使用 `QueryRunner` 而非 `@Transaction`
   - 记得 `commit()` 和 `rollback()`

3. **认证授权**
   - 使用 `@UseGuards(JwtAuthGuard)` 保护API
   - 使用 `@Public()` 标记公开API
   - 密码必须使用 `bcrypt` 加密

4. **API设计**
   - RESTful风格
   - 统一的响应格式
   - 完整的错误处理

5. **代码质量**
   - 每个Service方法添加详细注释
   - 关键操作记录日志
   - 使用DTO进行参数验证

---

**下一步**: 查看 `FRONTEND_REFERENCE.md` 了解前端实现

**完整提示词**: 查看 `REPLICATION_PROMPTS.md` 获取分步实施指南

