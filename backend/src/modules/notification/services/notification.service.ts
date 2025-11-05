import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationSetting } from '../entities/notification-setting.entity';
import { EmailService } from './email.service';
import { TelegramService } from './telegram.service';
import { User } from '../../user/entities/user.entity';
import { CreateNotificationDto, UpdateSettingsDto, NotificationFiltersDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationSetting)
    private settingRepo: Repository<NotificationSetting>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private emailService: EmailService,
    private telegramService: TelegramService,
  ) {}

  // 创建通知（自动判断发送渠道）
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const { userId, type, title, content, data } = dto;

    // 获取用户信息
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取通知设置
    let setting = await this.settingRepo.findOne({ where: { userId } });

    if (!setting) {
      // 如果没有设置，创建默认设置
      setting = this.settingRepo.create({ userId });
      setting = await this.settingRepo.save(setting);
    }

    // 创建站内通知
    const notification = this.notificationRepo.create({
      userId,
      type,
      title,
      content,
      data,
      sentInApp: true,
    });

    // 判断是否需要发送邮件
    const shouldSendEmail = this.shouldSendEmail(setting, type);
    if (shouldSendEmail && user.email) {
      const emailSent = await this.sendEmailByType(user.email, type, { title, content, data });
      notification.sentEmail = emailSent;
    }

    // 判断是否需要发送Telegram
    const shouldSendTelegram = this.shouldSendTelegram(setting, type);
    if (shouldSendTelegram && setting.telegramChatId) {
      const telegramSent = await this.sendTelegramByType(
        setting.telegramChatId,
        type,
        { title, content, data },
      );
      notification.sentTelegram = telegramSent;
    }

    return await this.notificationRepo.save(notification);
  }

  // 判断是否应该发送邮件
  private shouldSendEmail(setting: NotificationSetting, type: string): boolean {
    if (!setting.emailEnabled) return false;

    switch (type) {
      case 'order':
        return setting.emailOnOrder;
      case 'recharge':
        return setting.emailOnRecharge;
      case 'expiring':
        return setting.emailOnExpiring;
      case 'balance_low':
        return setting.emailOnBalanceLow;
      default:
        return true;
    }
  }

  // 判断是否应该发送Telegram
  private shouldSendTelegram(setting: NotificationSetting, type: string): boolean {
    if (!setting.telegramEnabled) return false;

    // 目前Telegram通知全部类型都发送
    return true;
  }

  // 根据类型发送邮件
  private async sendEmailByType(email: string, type: string, data: any): Promise<boolean> {
    switch (type) {
      case 'order':
        return this.emailService.sendOrderNotification(email, data.data);
      case 'recharge':
        return this.emailService.sendRechargeNotification(email, data.data);
      case 'expiring':
        return this.emailService.sendExpiringNotification(email, data.data);
      case 'balance_low':
        return this.emailService.sendBalanceLowNotification(email, data.data.balance);
      default:
        return this.emailService.sendNotification(email, data.title, data.content, data.data);
    }
  }

  // 根据类型发送Telegram
  private async sendTelegramByType(chatId: string, type: string, data: any): Promise<boolean> {
    switch (type) {
      case 'order':
        return this.telegramService.sendOrderNotification(chatId, data.data);
      case 'recharge':
        return this.telegramService.sendRechargeNotification(chatId, data.data);
      case 'expiring':
        return this.telegramService.sendExpiringNotification(chatId, data.data);
      case 'balance_low':
        return this.telegramService.sendBalanceLowNotification(chatId, data.data.balance);
      default:
        return this.telegramService.sendNotification(chatId, data.content);
    }
  }

  // 获取通知列表
  async getNotifications(userId: number, filters: NotificationFiltersDto) {
    const { type, read, page = 1, limit = 20 } = filters;

    const query = this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (type) {
      query.andWhere('notification.type = :type', { type });
    }

    if (read !== undefined) {
      query.andWhere('notification.read = :read', { read });
    }

    const [data, total] = await query
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      unreadCount: await this.getUnreadCount(userId),
    };
  }

  // 获取未读数量
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepo.count({
      where: { userId, read: false },
    });
  }

  // 标记为已读
  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    notification.read = true;
    notification.readAt = new Date();

    return await this.notificationRepo.save(notification);
  }

  // 全部标记为已读
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepo.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  // 删除通知
  async deleteNotification(id: number, userId: number): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    await this.notificationRepo.remove(notification);
  }

  // 获取通知设置
  async getSettings(userId: number): Promise<NotificationSetting> {
    let setting = await this.settingRepo.findOne({ where: { userId } });

    if (!setting) {
      setting = this.settingRepo.create({ userId });
      setting = await this.settingRepo.save(setting);
    }

    return setting;
  }

  // 更新通知设置
  async updateSettings(userId: number, dto: UpdateSettingsDto): Promise<NotificationSetting> {
    let setting = await this.settingRepo.findOne({ where: { userId } });

    if (!setting) {
      setting = this.settingRepo.create({ userId });
    }

    Object.assign(setting, dto);

    return await this.settingRepo.save(setting);
  }

  // 生成Telegram绑定码
  generateTelegramBindCode(userId: number): string {
    return this.telegramService.generateBindCode(userId);
  }

  // 解绑Telegram
  async unbindTelegram(userId: number): Promise<void> {
    const setting = await this.settingRepo.findOne({ where: { userId } });

    if (setting) {
      setting.telegramChatId = null;
      setting.telegramUsername = null;
      setting.telegramEnabled = false;
      await this.settingRepo.save(setting);
    }
  }
}


