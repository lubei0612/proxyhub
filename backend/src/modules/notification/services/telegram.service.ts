import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from '../entities/notification-setting.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;
  private bindCodes: Map<string, { userId: number; expiresAt: Date }> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectRepository(NotificationSetting)
    private settingRepo: Repository<NotificationSetting>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!token) {
      this.logger.warn('Telegram Bot未配置，将跳过Bot初始化');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupCommands();
      this.logger.log('Telegram Bot初始化成功');
    } catch (error) {
      this.logger.error(`Telegram Bot初始化失败: ${error.message}`, error.stack);
    }
  }

  private setupCommands() {
    // /start 命令 - 开始绑定
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const bindCode = match[1];

      await this.handleBind(chatId, bindCode, msg.from.username);
    });

    // /start 命令 - 无参数
    this.bot.onText(/\/start$/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;

      await this.bot.sendMessage(
        chatId,
        `👋 欢迎使用ProxyHub通知Bot！\n\n` +
          `请在ProxyHub网站的账户设置中生成绑定码，然后使用以下格式绑定：\n` +
          `/start <绑定码>\n\n` +
          `绑定后，您将收到订单、充值等重要通知。`,
      );
    });

    // /balance 命令 - 查询余额
    this.bot.onText(/\/balance/, async (msg) => {
      const chatId = msg.chat.id;
      await this.handleBalance(chatId);
    });

    // /orders 命令 - 查询最近订单
    this.bot.onText(/\/orders/, async (msg) => {
      const chatId = msg.chat.id;
      await this.handleOrders(chatId);
    });

    // /unbind 命令 - 解绑账户
    this.bot.onText(/\/unbind/, async (msg) => {
      const chatId = msg.chat.id;
      await this.handleUnbind(chatId);
    });

    // /help 命令
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(
        chatId,
        `📖 *ProxyHub Bot 帮助*\n\n` +
          `/start <绑定码> - 绑定您的ProxyHub账户\n` +
          `/balance - 查询账户余额\n` +
          `/orders - 查看最近订单\n` +
          `/unbind - 解绑账户\n` +
          `/help - 显示此帮助信息\n\n` +
          `如有疑问，请联系客服：@lubei12`,
        { parse_mode: 'Markdown' },
      );
    });
  }

  // 处理绑定
  private async handleBind(chatId: number, bindCode: string, username?: string) {
    const bindData = this.bindCodes.get(bindCode);

    if (!bindData) {
      await this.bot.sendMessage(
        chatId,
        '❌ 绑定码无效或已过期，请重新生成。',
      );
      return;
    }

    if (new Date() > bindData.expiresAt) {
      this.bindCodes.delete(bindCode);
      await this.bot.sendMessage(
        chatId,
        '❌ 绑定码已过期，请重新生成。',
      );
      return;
    }

    try {
      // 查找或创建通知设置
      let setting = await this.settingRepo.findOne({
        where: { userId: bindData.userId },
      });

      if (!setting) {
        setting = this.settingRepo.create({
          userId: bindData.userId,
        });
      }

      // 更新Telegram信息
      setting.telegramChatId = chatId.toString();
      setting.telegramUsername = username || '';
      setting.telegramEnabled = true;

      await this.settingRepo.save(setting);

      // 删除已使用的绑定码
      this.bindCodes.delete(bindCode);

      await this.bot.sendMessage(
        chatId,
        `✅ 绑定成功！\n\n` +
          `您的ProxyHub账户已成功绑定到Telegram。\n` +
          `现在您将收到重要的通知消息。\n\n` +
          `使用 /help 查看可用命令。`,
      );

      this.logger.log(`用户 ${bindData.userId} 成功绑定Telegram`);
    } catch (error) {
      this.logger.error(`绑定失败: ${error.message}`, error.stack);
      await this.bot.sendMessage(
        chatId,
        '❌ 绑定失败，请稍后重试或联系客服。',
      );
    }
  }

  // 查询余额
  private async handleBalance(chatId: number) {
    try {
      const setting = await this.settingRepo.findOne({
        where: { telegramChatId: chatId.toString() },
      });

      if (!setting) {
        await this.bot.sendMessage(
          chatId,
          '❌ 账户未绑定，请先使用 /start <绑定码> 进行绑定。',
        );
        return;
      }

      const user = await this.userRepo.findOne({
        where: { id: setting.userId },
      });

      if (!user) {
        await this.bot.sendMessage(chatId, '❌ 用户信息未找到。');
        return;
      }

      await this.bot.sendMessage(
        chatId,
        `💰 *账户余额*\n\n` +
          `余额：$${parseFloat(user.balance.toString()).toFixed(2)}\n` +
          `赠送余额：$${parseFloat(user.gift_balance.toString()).toFixed(2)}`,
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      this.logger.error(`查询余额失败: ${error.message}`, error.stack);
      await this.bot.sendMessage(chatId, '❌ 查询失败，请稍后重试。');
    }
  }

  // 查询订单（简化版）
  private async handleOrders(chatId: number) {
    await this.bot.sendMessage(
      chatId,
      '📦 订单查询功能正在开发中...\n\n' +
        '请访问ProxyHub网站查看详细订单信息。',
    );
  }

  // 解绑账户
  private async handleUnbind(chatId: number) {
    try {
      const setting = await this.settingRepo.findOne({
        where: { telegramChatId: chatId.toString() },
      });

      if (!setting) {
        await this.bot.sendMessage(
          chatId,
          '❌ 账户未绑定。',
        );
        return;
      }

      setting.telegramChatId = null;
      setting.telegramUsername = null;
      setting.telegramEnabled = false;

      await this.settingRepo.save(setting);

      await this.bot.sendMessage(
        chatId,
        '✅ 账户已成功解绑。\n\n' +
          '您将不再收到ProxyHub的通知消息。\n' +
          '如需重新绑定，请使用 /start <绑定码>',
      );

      this.logger.log(`ChatId ${chatId} 成功解绑`);
    } catch (error) {
      this.logger.error(`解绑失败: ${error.message}`, error.stack);
      await this.bot.sendMessage(chatId, '❌ 解绑失败，请稍后重试。');
    }
  }

  // 生成绑定码
  generateBindCode(userId: number): string {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10分钟过期

    this.bindCodes.set(code, { userId, expiresAt });

    this.logger.log(`为用户 ${userId} 生成绑定码: ${code}`);
    return code;
  }

  // 发送通知
  async sendNotification(chatId: string, message: string): Promise<boolean> {
    if (!this.bot) {
      this.logger.warn('Telegram Bot未初始化，跳过发送');
      return false;
    }

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      this.logger.log(`Telegram消息发送成功: chatId=${chatId}`);
      return true;
    } catch (error) {
      this.logger.error(`Telegram消息发送失败: ${error.message}`, error.stack);
      return false;
    }
  }

  // 订单通知
  async sendOrderNotification(chatId: string, orderData: any): Promise<boolean> {
    const message =
      `📦 *订单通知*\n\n` +
      `订单号：\`${orderData.orderNo}\`\n` +
      `商品：${orderData.productType}\n` +
      `金额：$${orderData.amount}\n` +
      `状态：${orderData.status === 'completed' ? '已完成' : '处理中'}`;

    return this.sendNotification(chatId, message);
  }

  // 充值通知
  async sendRechargeNotification(chatId: string, rechargeData: any): Promise<boolean> {
    const message =
      `💰 *充值成功*\n\n` +
      `充值金额：$${rechargeData.amount}\n` +
      `当前余额：$${rechargeData.balance}`;

    return this.sendNotification(chatId, message);
  }

  // 到期提醒
  async sendExpiringNotification(chatId: string, proxyData: any): Promise<boolean> {
    const message =
      `⏰ *IP到期提醒*\n\n` +
      `IP地址：\`${proxyData.ip}\`\n` +
      `剩余天数：${proxyData.daysLeft}天\n` +
      `到期时间：${proxyData.expiresAt}\n\n` +
      `请及时续费以免影响使用。`;

    return this.sendNotification(chatId, message);
  }

  // 余额不足提醒
  async sendBalanceLowNotification(chatId: string, balance: number): Promise<boolean> {
    const message =
      `⚠️ *余额不足提醒*\n\n` +
      `当前余额：$${balance.toFixed(2)}\n\n` +
      `建议及时充值以免影响使用。`;

    return this.sendNotification(chatId, message);
  }
}

