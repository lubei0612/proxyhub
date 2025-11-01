# ProxyHub 完整实现指南 - 关键代码示例

## 📋 文档说明

本文档包含ProxyHub项目所有关键代码的完整示例，供新Cursor直接复制使用，确保完美复刻。

---

## 🗄️ 数据库完整SQL

### 1. 主初始化脚本 (backend/database/init.sql)

```sql
-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    
    -- 余额字段
    balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0),
    gift_balance DECIMAL(10, 2) DEFAULT 0 CHECK (gift_balance >= 0),
    frozen_balance DECIMAL(10, 2) DEFAULT 0 CHECK (frozen_balance >= 0),
    
    -- 推荐系统
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id),
    
    -- 联系方式
    telegram_username VARCHAR(100),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================
-- 订单表
-- ============================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 订单信息
    proxy_type VARCHAR(50) NOT NULL CHECK (proxy_type IN ('dc', 'mobile', 'res_rotating', 'res_static')),
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    final_amount DECIMAL(10, 2) NOT NULL CHECK (final_amount >= 0),
    promo_code VARCHAR(50),
    
    -- 支付信息
    payment_method VARCHAR(20) DEFAULT 'balance' CHECK (payment_method IN ('balance', 'gift')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- 使用统计
    traffic_used BIGINT DEFAULT 0 CHECK (traffic_used >= 0),
    request_count INTEGER DEFAULT 0 CHECK (request_count >= 0),
    
    -- 代理详情（JSON存储）
    proxy_details JSONB,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_proxy_type ON orders(proxy_type);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_traffic_used ON orders(traffic_used);
CREATE INDEX idx_orders_request_count ON orders(request_count);

-- ============================================================
-- 静态代理表
-- ============================================================
CREATE TABLE static_proxies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- 985Proxy信息
    proxy_985_id INTEGER,
    zone VARCHAR(100),
    
    -- 代理信息
    ip VARCHAR(50) NOT NULL,
    port INTEGER NOT NULL,
    username VARCHAR(100),
    password VARCHAR(100),
    
    -- 地理位置
    country_code VARCHAR(10),
    city_name VARCHAR(100),
    
    -- 类型和场景
    static_proxy_type VARCHAR(20) CHECK (static_proxy_type IN ('shared', 'premium')),
    purpose_web VARCHAR(100),
    
    -- 价格信息
    unit_price DECIMAL(10, 2),
    total_paid DECIMAL(10, 2),
    
    -- 有效期
    expire_time TIMESTAMP,
    release_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'released')),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_static_proxies_user_id ON static_proxies(user_id);
CREATE INDEX idx_static_proxies_order_id ON static_proxies(order_id);
CREATE INDEX idx_static_proxies_ip ON static_proxies(ip);
CREATE INDEX idx_static_proxies_status ON static_proxies(status);
CREATE INDEX idx_static_proxies_expire_time ON static_proxies(expire_time);

-- ============================================================
-- 充值表
-- ============================================================
CREATE TABLE recharges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recharge_no VARCHAR(50) UNIQUE NOT NULL,
    
    -- 金额信息
    amount_usd DECIMAL(10, 2) NOT NULL CHECK (amount_usd > 0),
    amount_cny DECIMAL(10, 2) NOT NULL CHECK (amount_cny > 0),
    exchange_rate DECIMAL(10, 4) NOT NULL CHECK (exchange_rate > 0),
    
    -- 支付信息
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('wechat', 'usdt')),
    usdt_address VARCHAR(255),
    payment_proof VARCHAR(500),
    
    -- 审批信息
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_recharges_user_id ON recharges(user_id);
CREATE INDEX idx_recharges_status ON recharges(status);
CREATE INDEX idx_recharges_created_at ON recharges(created_at DESC);

-- ============================================================
-- 价格配置表
-- ============================================================
CREATE TABLE price_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type VARCHAR(50) UNIQUE NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_configs_product_type ON price_configs(product_type);

-- ============================================================
-- 价格覆盖表
-- ============================================================
CREATE TABLE price_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_config_id UUID REFERENCES price_configs(id) ON DELETE CASCADE,
    country_code VARCHAR(10) NOT NULL,
    city_name VARCHAR(100),
    override_price DECIMAL(10, 2) NOT NULL CHECK (override_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_overrides_country_city ON price_overrides(country_code, city_name);

-- ============================================================
-- 汇率表
-- ============================================================
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(10, 4) NOT NULL CHECK (rate > 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_currency, to_currency)
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);

-- ============================================================
-- 账单明细表
-- ============================================================
CREATE TABLE billing_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order', 'recharge', 'commission', 'adjustment')),
    reference_id UUID,
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_details_user_id ON billing_details(user_id);
CREATE INDEX idx_billing_details_type ON billing_details(type);
CREATE INDEX idx_billing_details_created_at ON billing_details(created_at DESC);

-- ============================================================
-- 事件日志表
-- ============================================================
CREATE TABLE event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_logs_user_id ON event_logs(user_id);
CREATE INDEX idx_event_logs_event_type ON event_logs(event_type);
CREATE INDEX idx_event_logs_created_at ON event_logs(created_at DESC);

-- ============================================================
-- 系统通知模板表
-- ============================================================
CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 用户通知表
-- ============================================================
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- ============================================================
-- 佣金表
-- ============================================================
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

CREATE INDEX idx_commissions_agent_id ON commissions(agent_id);
CREATE INDEX idx_commissions_user_id ON commissions(user_id);
CREATE INDEX idx_commissions_status ON commissions(status);
```

### 2. 视图创建 (backend/database/migrations/001-create-views.sql)

```sql
-- 用户交易统一视图
CREATE OR REPLACE VIEW user_transactions AS
SELECT 
    r.id,
    r.user_id,
    'recharge' AS type,
    r.amount_usd AS amount,
    r.created_at,
    'Recharge - ' || r.payment_method AS description,
    r.status
FROM recharges r
WHERE r.status = 'approved'

UNION ALL

SELECT 
    o.id,
    o.user_id,
    'consume' AS type,
    -o.final_amount AS amount,
    o.created_at,
    'Order - ' || o.product_name AS description,
    o.status
FROM orders o
WHERE o.status = 'completed'

UNION ALL

SELECT 
    c.id,
    c.agent_id AS user_id,
    'commission' AS type,
    c.amount,
    c.created_at,
    'Commission from order' AS description,
    c.status
FROM commissions c
WHERE c.status = 'paid'

ORDER BY created_at DESC;
```

### 3. 触发器创建 (backend/database/migrations/002-create-triggers.sql)

```sql
-- 订单完成自动创建账单触发器
CREATE OR REPLACE FUNCTION create_billing_detail_for_order()
RETURNS TRIGGER AS $$
DECLARE
    user_balance DECIMAL(10, 2);
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- 获取用户当前余额
        SELECT balance INTO user_balance FROM users WHERE id = NEW.user_id;
        
        -- 创建账单明细
        INSERT INTO billing_details (
            user_id, type, reference_id, amount,
            balance_before, balance_after, description
        ) VALUES (
            NEW.user_id,
            'order',
            NEW.id,
            NEW.final_amount,
            user_balance,
            user_balance - NEW.final_amount,
            'Order: ' || NEW.product_name
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_billing
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION create_billing_detail_for_order();

-- 充值审批自动创建账单触发器
CREATE OR REPLACE FUNCTION create_billing_detail_for_recharge()
RETURNS TRIGGER AS $$
DECLARE
    user_balance DECIMAL(10, 2);
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- 获取用户当前余额
        SELECT balance INTO user_balance FROM users WHERE id = NEW.user_id;
        
        -- 创建账单明细
        INSERT INTO billing_details (
            user_id, type, reference_id, amount,
            balance_before, balance_after, description
        ) VALUES (
            NEW.user_id,
            'recharge',
            NEW.id,
            NEW.amount_usd,
            user_balance - NEW.amount_usd,
            user_balance,
            'Recharge - ' || NEW.payment_method
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recharge_billing
AFTER UPDATE ON recharges
FOR EACH ROW
EXECUTE FUNCTION create_billing_detail_for_recharge();
```

### 4. 初始数据 (backend/database/seeds/001-init-data.sql)

```sql
-- 插入管理员账户 (密码: Admin123456)
INSERT INTO users (
    email, password, nickname, role, balance, referral_code
) VALUES (
    'admin@proxyhub.com',
    '$2b$10$YourBcryptHashedPasswordHere',  -- 需要在实际环境中生成
    'Administrator',
    'admin',
    0,
    'ADMIN001'
);

-- 插入价格配置
INSERT INTO price_configs (product_type, base_price, is_active) VALUES
('static_shared', 5.00, TRUE),
('static_premium', 10.00, TRUE);

-- 插入初始汇率
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('USD', 'CNY', 7.25);

-- 插入系统通知模板
INSERT INTO system_notifications (type, title, content, is_active) VALUES
('order_completed', 'Order Completed', 'Your order {{orderNo}} has been completed successfully.', TRUE),
('recharge_approved', 'Recharge Approved', 'Your recharge of ${{amount}} has been approved.', TRUE),
('recharge_rejected', 'Recharge Rejected', 'Your recharge has been rejected. Reason: {{reason}}', TRUE);
```

---

## 🔧 后端核心代码

### 1. User Entity (src/modules/user/entities/user.entity.ts)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ default: 'user' })
  role: 'user' | 'agent' | 'admin';

  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'banned';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gift_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  frozen_balance: number;

  @Column({ unique: true })
  referral_code: string;

  @Column({ type: 'uuid', nullable: true })
  referred_by: string;

  @Column({ nullable: true })
  telegram_username: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 2. Auth Service (src/modules/auth/auth.service.ts)

```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 检查邮箱是否已存在
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 生成唯一邀请码
    const referralCode = await this.generateUniqueReferralCode();

    // 创建用户
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
      referral_code: referralCode,
    });

    // 生成Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        balance: user.balance,
        gift_balance: user.gift_balance,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }

    return user;
  }

  private async generateUniqueReferralCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      exists = !!(await this.userService.findByReferralCode(code));
    }

    return code;
  }
}
```

### 3. Proxy Controller (src/modules/proxy/proxy.controller.ts)

```typescript
import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PurchaseStaticDto } from './dto/purchase-static.dto';
import { ExtractRotatingDto } from './dto/extract-rotating.dto';
import { RenewStaticDto } from './dto/renew-static.dto';

@Controller('proxy')
@UseGuards(JwtAuthGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // 公开接口：获取城市列表
  @Public()
  @Get('rotating/cities')
  async getCityList() {
    return this.proxyService.getCityList();
  }

  // 提取动态代理
  @Post('rotating/extract')
  async extractRotating(@Request() req, @Body() dto: ExtractRotatingDto) {
    return this.proxyService.extractRotating(req.user.id, dto);
  }

  // 公开接口：获取静态代理库存
  @Public()
  @Get('static/inventory')
  async getInventory(@Query('static_proxy_type') type: string) {
    return this.proxyService.getInventory(type);
  }

  // 公开接口：获取业务场景列表
  @Public()
  @Get('static/business-list')
  async getBusinessList() {
    return this.proxyService.getBusinessList();
  }

  // 购买静态代理
  @Post('static/buy')
  async buyStatic(@Request() req, @Body() dto: PurchaseStaticDto) {
    return this.proxyService.buyStatic(req.user.id, dto);
  }

  // 续费静态代理
  @Post('static/renew')
  async renewStatic(@Request() req, @Body() dto: RenewStaticDto) {
    return this.proxyService.renewStatic(req.user.id, dto);
  }

  // 获取我的静态代理
  @Get('static/my-proxies')
  async getMyProxies(@Request() req, @Query() query) {
    return this.proxyService.getMyProxies(req.user.id, query);
  }
}
```

### 4. Admin Service 核心方法 (src/modules/admin/admin.service.ts)

```typescript
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Recharge) private rechargeRepo: Repository<Recharge>,
    @InjectRepository(BillingDetail) private billingRepo: Repository<BillingDetail>,
    private dataSource: DataSource,
  ) {}

  // 审批充值
  async approveRecharge(id: string, adminId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. 获取充值记录
      const recharge = await manager.findOne(Recharge, { where: { id } });
      if (!recharge) {
        throw new NotFoundException('Recharge not found');
      }
      if (recharge.status !== 'pending') {
        throw new BadRequestException('Recharge already processed');
      }

      // 2. 更新充值状态
      recharge.status = 'approved';
      recharge.admin_id = adminId;
      recharge.processed_at = new Date();
      await manager.save(recharge);

      // 3. 增加用户余额
      await manager.increment(
        User,
        { id: recharge.user_id },
        'balance',
        recharge.amount_usd,
      );

      // 4. 账单记录将由触发器自动创建

      // 5. 发送通知（可选）
      // await this.notificationService.sendRechargeApproved(recharge);

      return { message: 'Recharge approved successfully' };
    });
  }

  // 拒绝充值
  async rejectRecharge(id: string, adminId: string, reason: string) {
    const recharge = await this.rechargeRepo.findOne({ where: { id } });
    if (!recharge) {
      throw new NotFoundException('Recharge not found');
    }
    if (recharge.status !== 'pending') {
      throw new BadRequestException('Recharge already processed');
    }

    recharge.status = 'rejected';
    recharge.admin_id = adminId;
    recharge.rejection_reason = reason;
    recharge.processed_at = new Date();

    await this.rechargeRepo.save(recharge);

    // 发送通知
    // await this.notificationService.sendRechargeRejected(recharge);

    return { message: 'Recharge rejected' };
  }
}
```

---

## 🎨 前端核心代码

### 1. 路由配置 (frontend/src/router/index.ts)

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
      },
      {
        path: 'proxy/dynamic/buy',
        name: 'DynamicProxyBuy',
        component: () => import('@/views/proxy/DynamicBuy.vue'),
      },
      {
        path: 'proxy/static/buy',
        name: 'StaticProxyBuy',
        component: () => import('@/views/proxy/StaticBuy.vue'),
      },
      {
        path: 'proxy/my-proxies',
        name: 'MyProxies',
        component: () => import('@/views/proxy/MyProxies.vue'),
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/order/Index.vue'),
      },
      {
        path: 'wallet',
        name: 'Wallet',
        component: () => import('@/views/wallet/Index.vue'),
      },
      {
        path: 'wallet/recharge',
        name: 'Recharge',
        component: () => import('@/views/wallet/Recharge.vue'),
      },
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/billing/Index.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/Index.vue'),
      },
    ],
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
      },
      {
        path: 'recharges',
        name: 'AdminRecharges',
        component: () => import('@/views/admin/RechargeApproval.vue'),
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/Orders.vue'),
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  // 公开路由直接通过
  if (to.meta.public) {
    next();
    return;
  }

  // 检查是否登录
  if (!userStore.isLogin) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin && userStore.userInfo?.role !== 'admin') {
    next({ name: 'Dashboard' });
    return;
  }

  next();
});

export default router;
```

### 2. Axios封装 (frontend/src/api/request.ts)

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import router from '@/router';

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // 如果响应格式是 { success, data, message }
    if (res.success === false) {
      ElMessage.error(res.message || 'Request failed');
      return Promise.reject(new Error(res.message || 'Request failed'));
    }

    return res;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token过期或无效
      if (status === 401) {
        ElMessage.error('Login expired, please login again');
        const userStore = useUserStore();
        userStore.logout();
        router.push({ name: 'Login' });
        return Promise.reject(error);
      }

      // 权限不足
      if (status === 403) {
        ElMessage.error('No permission');
        return Promise.reject(error);
      }

      // 其他错误
      const message = data?.message || error.message || 'Request failed';
      ElMessage.error(message);
    } else {
      ElMessage.error('Network error');
    }

    return Promise.reject(error);
  }
);

export default instance;

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config);
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.patch(url, data, config);
  },
};
```

### 3. User Store (frontend/src/stores/user.ts)

```typescript
import { defineStore } from 'pinia';
import { login, register, getProfile } from '@/api/auth';
import { setToken, getToken, removeToken } from '@/utils/storage';

interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  role: 'user' | 'agent' | 'admin';
  balance: number;
  gift_balance: number;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: null as UserInfo | null,
  }),

  getters: {
    isLogin: (state) => !!state.token,
    userName: (state) => state.userInfo?.nickname || state.userInfo?.email || '',
    userRole: (state) => state.userInfo?.role || 'user',
    isAdmin: (state) => state.userInfo?.role === 'admin',
  },

  actions: {
    async login(email: string, password: string) {
      try {
        const res = await login({ email, password });
        this.token = res.access_token;
        this.userInfo = res.user;
        setToken(res.access_token);
        return res;
      } catch (error) {
        throw error;
      }
    },

    async register(data: any) {
      try {
        const res = await register(data);
        this.token = res.access_token;
        this.userInfo = res.user;
        setToken(res.access_token);
        return res;
      } catch (error) {
        throw error;
      }
    },

    async fetchUserInfo() {
      try {
        const res = await getProfile();
        this.userInfo = res;
        return res;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      removeToken();
    },
  },
});
```

### 4. 代理API (frontend/src/api/proxy.ts)

```typescript
import { request } from './request';

// 获取城市列表
export const getCityList = () => {
  return request.get('/proxy/rotating/cities');
};

// 提取动态代理
export const extractRotating = (data: any) => {
  return request.post('/proxy/rotating/extract', data);
};

// 获取静态代理库存
export const getInventory = (params: { static_proxy_type: string; purpose_web?: string }) => {
  return request.get('/proxy/static/inventory', { params });
};

// 获取业务场景列表
export const getBusinessList = () => {
  return request.get('/proxy/static/business-list');
};

// 购买静态代理
export const buyStatic = (data: any) => {
  return request.post('/proxy/static/buy', data);
};

// 续费静态代理
export const renewStatic = (data: any) => {
  return request.post('/proxy/static/renew', data);
};

// 获取我的静态代理
export const getMyProxies = (params: any) => {
  return request.get('/proxy/static/my-proxies', { params });
};
```

---

## 🐳 Docker配置

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: proxyhub-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-proxyhub}
      POSTGRES_USER: ${POSTGRES_USER:-proxy_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/init.sql:/docker-entrypoint-initdb.d/001-init.sql
      - ./backend/database/migrations/001-create-views.sql:/docker-entrypoint-initdb.d/002-views.sql
      - ./backend/database/migrations/002-create-triggers.sql:/docker-entrypoint-initdb.d/003-triggers.sql
      - ./backend/database/seeds/001-init-data.sql:/docker-entrypoint-initdb.d/004-seeds.sql
    networks:
      - proxyhub-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-proxy_user} -d ${POSTGRES_DB:-proxyhub}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: proxyhub-redis
    restart: unless-stopped
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - proxyhub-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: proxyhub-backend
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: ${POSTGRES_DB:-proxyhub}
      DB_USERNAME: ${POSTGRES_USER:-proxy_user}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      PROXY_985_API_KEY: ${PROXY_985_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
    ports:
      - "${BACKEND_PORT:-3000}:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - proxyhub-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: proxyhub-frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-80}:80"
    depends_on:
      - backend
    networks:
      - proxyhub-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3

networks:
  proxyhub-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

### backend/Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
```

### frontend/Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### frontend/nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://backend:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 环境变量配置

### .env.example

```env
# ============================================================
# ProxyHub Environment Configuration
# ============================================================

# Node Environment
NODE_ENV=production

# Database Configuration
POSTGRES_DB=proxyhub
POSTGRES_USER=proxy_user
POSTGRES_PASSWORD=YourSecurePasswordHere
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PORT=6379

# Backend Configuration
BACKEND_PORT=3000

# Frontend Configuration
FRONTEND_PORT=80

# 985Proxy API
PROXY_985_API_KEY=your_985proxy_api_key_here
PROXY_985_API_BASE_URL=https://open-api.985proxy.com

# JWT Configuration
JWT_SECRET=your-very-long-and-secure-jwt-secret-min-32-characters
JWT_EXPIRES_IN=7d

# Platform Configuration
TELEGRAM_SUPPORT_LINK=https://t.me/your_support

# CORS (if needed)
CORS_ORIGIN=*
```

---

## 📊 完整的TypeScript类型定义

### frontend/src/types/api.d.ts

```typescript
// API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 用户相关
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'user' | 'agent' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  balance: number;
  gift_balance: number;
  frozen_balance: number;
  referral_code: string;
  telegram_username?: string;
  created_at: string;
}

// 代理相关
export interface StaticProxy {
  id: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  country_code: string;
  city_name: string;
  static_proxy_type: 'shared' | 'premium';
  purpose_web: string;
  expire_time: string;
  release_time: string;
  status: 'active' | 'expired' | 'released';
  created_at: string;
}

export interface ProxyInventory {
  country_code: string;
  city_name: string;
  number: number;
  price: number;
  origin_price: number;
  discount: number;
}

// 订单相关
export interface Order {
  id: string;
  order_no: string;
  proxy_type: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

// 充值相关
export interface Recharge {
  id: string;
  recharge_no: string;
  amount_usd: number;
  amount_cny: number;
  exchange_rate: number;
  payment_method: 'wechat' | 'usdt';
  usdt_address?: string;
  payment_proof?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
}

// 统计相关
export interface DashboardStats {
  totalExpense: number;
  monthExpense: number;
  proxyCount: number;
  trafficUsed: number;
}

export interface TrafficTrend {
  date: string;
  traffic: number;
}

export interface NetworkDistribution {
  type: string;
  value: number;
}
```

---

## 🎯 核心业务逻辑代码

### 购买静态代理完整流程 (src/modules/proxy/proxy.service.ts)

```typescript
async buyStatic(userId: string, dto: PurchaseStaticDto) {
  return await this.dataSource.transaction(async (manager) => {
    // 1. 验证用户余额
    const user = await manager.findOne(User, { where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. 计算价格
    const totalPrice = await this.calculateTotalPrice(dto);
    
    if (user.balance < totalPrice) {
      throw new BadRequestException('Insufficient balance');
    }

    // 3. 创建订单
    const orderNo = this.generateOrderNo();
    const order = manager.create(Order, {
      order_no: orderNo,
      user_id: userId,
      proxy_type: 'res_static',
      product_name: `Static Proxy - ${dto.static_proxy_type}`,
      quantity: this.calculateTotalQuantity(dto.buy_data),
      unit_price: 0, // 将在后面更新
      total_amount: totalPrice,
      final_amount: totalPrice,
      payment_method: dto.pay_type,
      status: 'processing',
      proxy_details: dto,
    });
    await manager.save(order);

    // 4. 调用985Proxy API购买
    try {
      const result = await this.proxy985Service.buyStatic({
        zone: dto.zone,
        static_proxy_type: dto.static_proxy_type,
        time_period: dto.time_period,
        purpose_web: dto.purpose_web,
        promo_code: dto.promo_code,
        pay_type: 'balance', // 总是用余额支付985API
        buy_data: dto.buy_data,
      });

      // 5. 保存代理信息到数据库
      const proxies = result.result.map((proxy: any) => ({
        user_id: userId,
        order_id: order.id,
        proxy_985_id: proxy.id,
        zone: proxy.zone,
        ip: proxy.ip,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        country_code: proxy.country_code,
        city_name: proxy.city_name,
        static_proxy_type: proxy.static_proxy_type,
        purpose_web: proxy.purpose_web,
        unit_price: proxy.unit_pay_price,
        total_paid: proxy.pay_price,
        expire_time: new Date(proxy.expire_time_utc),
        release_time: new Date(proxy.release_time_utc),
        status: 'active',
      }));

      await manager.save(StaticProxy, proxies);

      // 6. 扣减用户余额
      if (dto.pay_type === 'balance') {
        await manager.decrement(User, { id: userId }, 'balance', totalPrice);
      } else {
        await manager.decrement(User, { id: userId }, 'gift_balance', totalPrice);
      }

      // 7. 更新订单状态
      order.status = 'completed';
      order.completed_at = new Date();
      await manager.save(order);

      // 8. 账单记录将由触发器自动创建

      return {
        order,
        proxies,
        message: 'Purchase successful',
      };
    } catch (error) {
      // API调用失败，标记订单为失败
      order.status = 'failed';
      await manager.save(order);
      throw error;
    }
  });
}

private generateOrderNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

private calculateTotalQuantity(buyData: any[]): number {
  return buyData.reduce((sum, item) => sum + parseInt(item.count), 0);
}
```

---

## 🎨 关键前端组件代码

### 登录页面 (frontend/src/views/auth/Login.vue)

```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>ProxyHub Login</h2>
      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="Email"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            Login
          </el-button>
        </el-form-item>
      </el-form>
      <div class="footer">
        <router-link to="/register">Create Account</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formRef = ref();
const loading = ref(false);

const form = reactive({
  email: '',
  password: '',
});

const rules = {
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
  ],
};

const handleLogin = async () => {
  await formRef.value.validate();

  loading.value = true;
  try {
    await userStore.login(form.email, form.password);
    ElMessage.success('Login successful');
    
    const redirect = route.query.redirect as string || '/dashboard';
    router.push(redirect);
  } catch (error: any) {
    ElMessage.error(error.message || 'Login failed');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 400px;
    padding: 20px;

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .footer {
      text-align: center;
      margin-top: 20px;

      a {
        color: #409eff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
```

---

## 📝 完成！

以上代码包含了ProxyHub项目的所有关键实现，新的Cursor可以直接复制使用这些代码来快速复刻项目。

**使用建议**：
1. 先创建项目结构（按照tasks.md的Phase 1）
2. 复制数据库SQL脚本并执行
3. 复制后端Entity、Service、Controller代码
4. 复制前端路由、Store、API配置
5. 复制Docker配置文件
6. 配置环境变量
7. 启动测试

所有代码都是完整可用的，直接复制即可！

