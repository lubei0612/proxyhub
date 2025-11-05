# 动态代理和通知系统 - 设计文档

## 📐 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Vue 3)                         │
├──────────────────┬──────────────────┬──────────────────────┤
│ 动态代理管理      │  通知设置页面     │  Telegram绑定页面   │
│ - 通道列表        │  - 邮件通知开关   │  - 绑定流程          │
│ - 添加/编辑通道   │  - Telegram开关   │  - 绑定码生成        │
│ - 流量统计        │  - 通知历史       │  - 状态显示          │
└──────────────────┴──────────────────┴──────────────────────┘
                             ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API层 (NestJS)                          │
├──────────────────┬──────────────────┬──────────────────────┤
│ 动态代理模块      │  通知模块         │  Telegram模块       │
│ - ChannelService │  - NotifyService  │  - TelegramService  │
│ - UsageService   │  - EmailService   │  - WebhookHandler   │
└──────────────────┴──────────────────┴──────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    数据层 (PostgreSQL)                       │
├──────────────────┬──────────────────┬──────────────────────┤
│ dynamic_channels │  notifications   │  notification_       │
│ dynamic_usage    │  notification_   │  settings            │
│                  │  templates       │                      │
└──────────────────┴──────────────────┴──────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    外部服务                                   │
├──────────────────┬──────────────────┬──────────────────────┤
│ SMTP服务器        │  Telegram Bot    │  (未来) 985Proxy    │
│ - Gmail/SendGrid │  - Bot API       │  - 真实API对接       │
└──────────────────┴──────────────────┴──────────────────────┘
```

---

## 🗄️ 数据库设计

### 1. 动态代理通道表 (dynamic_channels)

```sql
CREATE TABLE dynamic_channels (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_name VARCHAR(100) NOT NULL,
  price_per_gb DECIMAL(10, 2) NOT NULL DEFAULT 4.5,
  concurrent_limit INTEGER NOT NULL DEFAULT 1000,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  total_traffic DECIMAL(15, 3) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT channels_status_check CHECK (status IN ('active', 'paused', 'disabled'))
);

CREATE INDEX idx_channels_user_id ON dynamic_channels(user_id);
CREATE INDEX idx_channels_status ON dynamic_channels(status);
```

### 2. 动态代理流量使用表 (dynamic_usage)

```sql
CREATE TABLE dynamic_usage (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER NOT NULL REFERENCES dynamic_channels(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  traffic DECIMAL(10, 3) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT usage_unique_channel_date UNIQUE (channel_id, date)
);

CREATE INDEX idx_usage_channel_id ON dynamic_usage(channel_id);
CREATE INDEX idx_usage_user_id ON dynamic_usage(user_id);
CREATE INDEX idx_usage_date ON dynamic_usage(date);
```

### 3. 通知表 (notifications)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT notifications_type_check CHECK (type IN ('success', 'info', 'warning', 'error')),
  CONSTRAINT notifications_category_check CHECK (category IN ('order', 'recharge', 'expiration', 'balance', 'system', 'proxy'))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 4. 通知设置表 (notification_settings)

```sql
CREATE TABLE notification_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  telegram_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  order_notification BOOLEAN NOT NULL DEFAULT TRUE,
  recharge_notification BOOLEAN NOT NULL DEFAULT TRUE,
  expiration_notification BOOLEAN NOT NULL DEFAULT TRUE,
  low_balance_notification BOOLEAN NOT NULL DEFAULT TRUE,
  low_balance_threshold DECIMAL(10, 2) NOT NULL DEFAULT 50,
  system_notification BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
```

### 5. 邮件模板表 (email_templates)

```sql
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,
  template_key VARCHAR(50) NOT NULL UNIQUE,
  subject VARCHAR(200) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 预设模板数据
INSERT INTO email_templates (template_key, subject, html_content, variables) VALUES
('order_success', 'ProxyHub - 订单购买成功', '<html>...</html>', '{"orderNo", "amount", "details"}'),
('recharge_approved', 'ProxyHub - 充值审核通过', '<html>...</html>', '{"amount", "balance"}'),
('ip_expiring', 'ProxyHub - IP即将到期提醒', '<html>...</html>', '{"ipAddress", "expiryDate"}');
```

### 6. users表新增字段

```sql
ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(50);
ALTER TABLE users ADD COLUMN telegram_username VARCHAR(100);
ALTER TABLE users ADD COLUMN telegram_bind_at TIMESTAMP;
ALTER TABLE users ADD COLUMN telegram_bind_code VARCHAR(20);

CREATE INDEX idx_users_telegram_chat_id ON users(telegram_chat_id);
CREATE INDEX idx_users_telegram_bind_code ON users(telegram_bind_code);
```

---

## 🏗️ 后端架构设计

### 模块划分

#### 1. DynamicProxyModule

**职责**: 动态代理通道和流量管理

**实体**:
- `DynamicChannel` - 通道实体
- `DynamicUsage` - 流量使用实体

**服务**:
```typescript
@Injectable()
export class DynamicChannelService {
  // 通道管理
  async createChannel(userId: number, dto: CreateChannelDto): Promise<DynamicChannel>
  async updateChannel(id: number, userId: number, dto: UpdateChannelDto): Promise<DynamicChannel>
  async deleteChannel(id: number, userId: number): Promise<void>
  async toggleChannelStatus(id: number, userId: number): Promise<DynamicChannel>
  async getChannels(userId: number, filters: ChannelFiltersDto): Promise<PaginatedResult<DynamicChannel>>
  async getChannelStatistics(userId: number): Promise<ChannelStatistics>
}

@Injectable()
export class DynamicUsageService {
  // 流量使用管理
  async recordUsage(channelId: number, dto: RecordUsageDto): Promise<DynamicUsage>
  async getUsageHistory(channelId: number, filters: UsageFiltersDto): Promise<PaginatedResult<DynamicUsage>>
  async getUsageStatistics(userId: number, dateRange: DateRangeDto): Promise<UsageStatistics>
  
  // 定时任务：模拟流量使用（开发环境）
  @Cron('0 0 * * *') // 每天凌晨
  async generateMockUsage(): Promise<void>
}
```

**控制器**:
```typescript
@Controller('proxy/dynamic')
@UseGuards(JwtAuthGuard)
export class DynamicProxyController {
  @Get('channels')
  async getChannels(@Request() req, @Query() filters: ChannelFiltersDto) {}
  
  @Post('channels')
  async createChannel(@Request() req, @Body() dto: CreateChannelDto) {}
  
  @Put('channels/:id')
  async updateChannel(@Param('id') id: string, @Request() req, @Body() dto: UpdateChannelDto) {}
  
  @Delete('channels/:id')
  async deleteChannel(@Param('id') id: string, @Request() req) {}
  
  @Patch('channels/:id/toggle')
  async toggleStatus(@Param('id') id: string, @Request() req) {}
  
  @Get('usage')
  async getUsage(@Request() req, @Query() filters: UsageFiltersDto) {}
  
  @Get('statistics')
  async getStatistics(@Request() req, @Query() dateRange: DateRangeDto) {}
}
```

#### 2. NotificationModule

**职责**: 通知创建、发送、历史管理

**实体**:
- `Notification` - 通知实体
- `NotificationSetting` - 通知设置实体
- `EmailTemplate` - 邮件模板实体

**服务**:
```typescript
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationSetting) private settingsRepo: Repository<NotificationSetting>,
    private emailService: EmailService,
    private telegramService: TelegramService,
  ) {}
  
  // 通知创建
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = await this.notificationRepo.save(dto);
    
    // 获取用户通知设置
    const settings = await this.getSettings(dto.userId);
    
    // 根据设置发送通知
    if (settings.emailEnabled && this.shouldSendEmail(settings, dto.category)) {
      await this.emailService.sendNotification(dto.userId, notification);
    }
    
    if (settings.telegramEnabled && this.shouldSendTelegram(settings, dto.category)) {
      await this.telegramService.sendNotification(dto.userId, notification);
    }
    
    return notification;
  }
  
  // 通知历史
  async getNotifications(userId: number, filters: NotificationFiltersDto): Promise<PaginatedResult<Notification>>
  async markAsRead(id: string, userId: number): Promise<Notification>
  async markAllAsRead(userId: number): Promise<void>
  async deleteNotification(id: string, userId: number): Promise<void>
  
  // 通知设置
  async getSettings(userId: number): Promise<NotificationSetting>
  async updateSettings(userId: number, dto: UpdateSettingsDto): Promise<NotificationSetting>
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }
  
  async sendNotification(userId: number, notification: Notification): Promise<void> {
    const user = await this.getUserWithEmail(userId);
    const template = await this.getTemplate(notification.category);
    
    const html = this.renderTemplate(template.htmlContent, notification);
    
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: user.email,
      subject: notification.title,
      html,
    });
  }
  
  async sendCustomEmail(to: string, subject: string, html: string): Promise<void>
}
```

#### 3. TelegramModule

**职责**: Telegram Bot交互、通知推送

**服务**:
```typescript
@Injectable()
export class TelegramService {
  private bot: TelegramBot;
  
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    const token = this.configService.get('TELEGRAM_BOT_TOKEN');
    this.bot = new TelegramBot(token, { polling: true });
    
    this.setupCommands();
  }
  
  private setupCommands() {
    // /start - 绑定流程
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, 
        '欢迎使用ProxyHub通知服务！\n\n' +
        '请输入您的绑定码（格式: XXXX-XXXX）\n' +
        '在ProxyHub网站的"账户设置"中获取绑定码'
      );
    });
    
    // /balance - 查询余额
    this.bot.onText(/\/balance/, async (msg) => {
      const user = await this.getUserByChatId(msg.chat.id.toString());
      if (!user) {
        await this.bot.sendMessage(msg.chat.id, '请先绑定账户');
        return;
      }
      await this.bot.sendMessage(msg.chat.id, 
        `💰 当前余额: $${user.balance.toFixed(2)}\n` +
        `🎁 赠送金额: $${user.giftBalance.toFixed(2)}`
      );
    });
    
    // /unbind - 解绑
    this.bot.onText(/\/unbind/, async (msg) => {
      await this.unbindTelegram(msg.chat.id.toString());
      await this.bot.sendMessage(msg.chat.id, '已解绑成功');
    });
    
    // 处理绑定码
    this.bot.on('message', async (msg) => {
      if (msg.text && /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(msg.text)) {
        await this.handleBindCode(msg.chat.id.toString(), msg.text, msg.from?.username);
      }
    });
  }
  
  async generateBindCode(userId: number): Promise<string> {
    const code = this.randomCode();
    await this.userRepo.update(userId, {
      telegramBindCode: code,
    });
    return code;
  }
  
  async handleBindCode(chatId: string, code: string, username?: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { telegramBindCode: code },
    });
    
    if (!user) {
      await this.bot.sendMessage(chatId, '❌ 绑定码无效或已过期');
      return;
    }
    
    await this.userRepo.update(user.id, {
      telegramChatId: chatId,
      telegramUsername: username,
      telegramBindAt: new Date(),
      telegramBindCode: null,
    });
    
    await this.bot.sendMessage(chatId, 
      `✅ 绑定成功！\n\n` +
      `账户: ${user.email}\n` +
      `余额: $${user.balance.toFixed(2)}\n\n` +
      `您将收到订单、充值等重要通知`
    );
  }
  
  async sendNotification(userId: number, notification: Notification): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.telegramChatId) return;
    
    const emoji = this.getEmoji(notification.type);
    const message = `${emoji} ${notification.title}\n\n${notification.content}`;
    
    await this.bot.sendMessage(user.telegramChatId, message);
  }
  
  async unbindTelegram(chatId: string): Promise<void> {
    await this.userRepo.update(
      { telegramChatId: chatId },
      {
        telegramChatId: null,
        telegramUsername: null,
        telegramBindAt: null,
      }
    );
  }
  
  private randomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3) code += '-';
    }
    return code;
  }
  
  private getEmoji(type: string): string {
    const map = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    };
    return map[type] || 'ℹ️';
  }
}
```

**控制器**:
```typescript
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  @Get()
  async getNotifications(@Request() req, @Query() filters: NotificationFiltersDto) {}
  
  @Get('settings')
  async getSettings(@Request() req) {}
  
  @Put('settings')
  async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {}
  
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {}
  
  @Patch('read-all')
  async markAllAsRead(@Request() req) {}
  
  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req) {}
  
  @Post('telegram/bind-code')
  async generateBindCode(@Request() req) {}
  
  @Delete('telegram/unbind')
  async unbindTelegram(@Request() req) {}
}
```

---

## 🎨 前端设计

### 1. 动态代理管理页面

**组件路径**: `frontend/src/views/proxy/DynamicChannels.vue`

**核心功能**:
```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as dynamicApi from '@/api/modules/dynamic';

// 状态管理
const loading = ref(false);
const channels = ref<any[]>([]);
const statistics = ref({ totalChannels: 0, totalTraffic: 0, totalCost: 0 });

// 筛选
const filters = ref({
  channelName: '',
  status: '',
});

// 对话框
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const formData = ref({
  channelName: '',
  pricePerGb: 4.5,
  concurrentLimit: 1000,
  status: 'active',
  remark: '',
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const [channelsRes, statsRes] = await Promise.all([
      dynamicApi.getChannels(filters.value),
      dynamicApi.getStatistics(),
    ]);
    channels.value = channelsRes.data;
    statistics.value = statsRes;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// CRUD操作
const handleCreate = () => {
  dialogMode.value = 'create';
  formData.value = { /* 默认值 */ };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  dialogMode.value = 'edit';
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleSave = async () => {
  try {
    if (dialogMode.value === 'create') {
      await dynamicApi.createChannel(formData.value);
      ElMessage.success('创建成功');
    } else {
      await dynamicApi.updateChannel(formData.value.id, formData.value);
      ElMessage.success('更新成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error('操作失败：' + error.message);
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除通道 "${row.channelName}" 吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await dynamicApi.deleteChannel(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message);
    }
  }
};

const handleToggle = async (row: any) => {
  try {
    await dynamicApi.toggleChannelStatus(row.id);
    ElMessage.success('状态已更新');
    loadData();
  } catch (error: any) {
    ElMessage.error('操作失败：' + error.message);
  }
};

onMounted(() => {
  loadData();
});
</script>
```

### 2. 通知设置页面

**组件路径**: `frontend/src/views/account/Notifications.vue`

**API对接改造**:
```typescript
// 替换 saveEmailSettings
const saveEmailSettings = async () => {
  try {
    saving.value = true;
    await notificationApi.updateSettings({
      emailEnabled: true,
      ...emailSettings.value,
    });
    ElMessage.success('邮件设置保存成功');
  } catch (error: any) {
    ElMessage.error('保存失败：' + error.message);
  } finally {
    saving.value = false;
  }
};

// 替换 recentNotifications
const loadNotifications = async () => {
  try {
    const response = await notificationApi.getNotifications({ limit: 10 });
    recentNotifications.value = response.data;
  } catch (error: any) {
    ElMessage.error('加载通知失败：' + error.message);
  }
};

// 替换 markAllAsRead
const markAllAsRead = async () => {
  try {
    await notificationApi.markAllAsRead();
    recentNotifications.value.forEach((n) => (n.isRead = true));
    ElMessage.success('已全部标记为已读');
  } catch (error: any) {
    ElMessage.error('操作失败：' + error.message);
  }
};
```

### 3. Telegram绑定页面

**组件路径**: `frontend/src/views/account/TelegramBind.vue`

**新建页面**:
```vue
<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Telegram绑定</span>
      </div>
    </template>
    
    <div class="bind-content">
      <el-alert
        title="绑定Telegram后，您可以接收重要通知"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />
      
      <!-- 未绑定状态 -->
      <div v-if="!isBound" class="bind-steps">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="生成绑定码" />
          <el-step title="打开Telegram Bot" />
          <el-step title="发送绑定码" />
          <el-step title="完成绑定" />
        </el-steps>
        
        <div class="bind-code" v-if="bindCode">
          <p>您的绑定码:</p>
          <h2>{{ bindCode }}</h2>
          <el-button @click="copyBindCode">复制绑定码</el-button>
        </div>
        
        <div class="bind-instructions">
          <h3>绑定步骤:</h3>
          <ol>
            <li>点击下方按钮生成绑定码</li>
            <li>在Telegram搜索 <code>@ProxyHubBot</code></li>
            <li>发送 <code>/start</code> 命令</li>
            <li>发送您的绑定码</li>
            <li>等待绑定确认</li>
          </ol>
        </div>
        
        <el-button type="primary" @click="generateBindCode" :loading="loading">
          生成绑定码
        </el-button>
      </div>
      
      <!-- 已绑定状态 -->
      <div v-else class="bind-success">
        <el-result icon="success" title="已绑定Telegram">
          <template #sub-title>
            <p>Telegram用户名: @{{ telegramUsername }}</p>
            <p>绑定时间: {{ bindTime }}</p>
          </template>
          <template #extra>
            <el-button type="danger" @click="handleUnbind">解绑Telegram</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as notificationApi from '@/api/modules/notification';
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs';

const userStore = useUserStore();
const loading = ref(false);
const bindCode = ref('');
const currentStep = ref(0);

const isBound = computed(() => !!userStore.user?.telegramUsername);
const telegramUsername = computed(() => userStore.user?.telegramUsername);
const bindTime = computed(() => 
  userStore.user?.telegramBindAt 
    ? dayjs(userStore.user.telegramBindAt).format('YYYY-MM-DD HH:mm') 
    : ''
);

const generateBindCode = async () => {
  loading.value = true;
  try {
    const response = await notificationApi.generateBindCode();
    bindCode.value = response.code;
    currentStep.value = 1;
    ElMessage.success('绑定码已生成，请按步骤操作');
  } catch (error: any) {
    ElMessage.error('生成失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

const copyBindCode = () => {
  navigator.clipboard.writeText(bindCode.value);
  ElMessage.success('已复制到剪贴板');
};

const handleUnbind = async () => {
  try {
    await ElMessageBox.confirm('确认解绑Telegram吗？', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await notificationApi.unbindTelegram();
    await userStore.fetchUserInfo();
    ElMessage.success('解绑成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('解绑失败：' + error.message);
    }
  }
};

onMounted(() => {
  // 如果已绑定，显示绑定信息
  if (isBound.value) {
    currentStep.value = 4;
  }
});
</script>
```

---

## 📡 API设计

### DTO定义

```typescript
// 动态代理DTOs
export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  channelName: string;
  
  @IsNumber()
  @Min(0)
  pricePerGb: number;
  
  @IsNumber()
  @Min(1)
  concurrentLimit: number;
  
  @IsEnum(['active', 'paused'])
  status: string;
  
  @IsOptional()
  @IsString()
  remark?: string;
}

export class ChannelFiltersDto {
  @IsOptional()
  @IsString()
  channelName?: string;
  
  @IsOptional()
  @IsEnum(['active', 'paused', 'disabled'])
  status?: string;
  
  @IsOptional()
  @IsNumber()
  page?: number;
  
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// 通知DTOs
export class CreateNotificationDto {
  @IsNumber()
  userId: number;
  
  @IsEnum(['success', 'info', 'warning', 'error'])
  type: string;
  
  @IsEnum(['order', 'recharge', 'expiration', 'balance', 'system', 'proxy'])
  category: string;
  
  @IsString()
  title: string;
  
  @IsString()
  content: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;
  
  @IsOptional()
  @IsBoolean()
  telegramEnabled?: boolean;
  
  @IsOptional()
  @IsBoolean()
  orderNotification?: boolean;
  
  // ... 其他字段
}
```

---

## 🔐 安全设计

### 1. Telegram Bot安全
- ✅ 绑定码一次性使用，过期时间24小时
- ✅ Chat ID验证，防止冒用
- ✅ Webhook签名验证（生产环境）

### 2. 邮件安全
- ✅ 速率限制（每用户每小时最多10封）
- ✅ 邮件模板XSS防护
- ✅ 邮箱验证

### 3. 数据安全
- ✅ Chat ID加密存储
- ✅ 通知内容敏感信息脱敏
- ✅ 定期清理过期通知（30天）

---

## 📊 监控和日志

### 1. 邮件发送监控
```typescript
@Injectable()
export class EmailMonitorService {
  private successCount = 0;
  private failureCount = 0;
  
  recordSuccess() {
    this.successCount++;
  }
  
  recordFailure(error: Error) {
    this.failureCount++;
    this.logger.error('邮件发送失败', error);
  }
  
  getMetrics() {
    return {
      success: this.successCount,
      failure: this.failureCount,
      successRate: this.successCount / (this.successCount + this.failureCount),
    };
  }
}
```

### 2. Telegram Bot监控
- ✅ Bot在线状态检测
- ✅ 消息发送成功率
- ✅ 绑定/解绑统计

---

## 🚀 部署配置

### 环境变量示例

```env
# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=proxyhub@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# Telegram配置
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=ProxyHubBot
TELEGRAM_WEBHOOK_URL=https://api.proxyhub.com/api/telegram/webhook
```

### Nginx配置（Telegram Webhook）

```nginx
location /api/telegram/webhook {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # Telegram IP白名单
    allow 149.154.160.0/20;
    allow 91.108.4.0/22;
    deny all;
}
```

---

**文档版本**: v1.0  
**最后更新**: 2025-11-04  
**负责人**: AI Assistant


