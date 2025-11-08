import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private backupTransporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // 初始化主邮箱（Outlook）
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const user = this.configService.get<string>('MAIL_USER');
    const password = this.configService.get<string>('MAIL_PASSWORD');

    if (user && password) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass: password,
        },
      });
      this.logger.log(`主邮箱服务初始化成功: ${user}`);
    } else {
      this.logger.warn('主邮箱服务未配置');
    }

    // 初始化备用邮箱（Gmail）
    const backupHost = this.configService.get<string>('MAIL_HOST_BACKUP');
    const backupPort = this.configService.get<number>('MAIL_PORT_BACKUP', 587);
    const backupUser = this.configService.get<string>('MAIL_USER_BACKUP');
    const backupPassword = this.configService.get<string>('MAIL_PASSWORD_BACKUP');

    if (backupUser && backupPassword) {
      this.backupTransporter = nodemailer.createTransport({
        host: backupHost,
        port: backupPort,
        secure: backupPort === 465,
        auth: {
          user: backupUser,
          pass: backupPassword,
        },
      });
      this.logger.log(`备用邮箱服务初始化成功: ${backupUser}`);
    } else {
      this.logger.warn('备用邮箱服务未配置');
    }

    if (!this.transporter && !this.backupTransporter) {
      this.logger.error('所有邮件服务均未配置，邮件功能将不可用');
    }
  }

  /**
   * 发送自定义HTML邮件（用于验证码等）
   * 主邮箱发送失败时自动切换到备用邮箱
   */
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<boolean> {
    if (!this.transporter && !this.backupTransporter) {
      this.logger.warn('所有邮件服务均未配置，跳过发送');
      return false;
    }

    // 尝试主邮箱发送
    if (this.transporter) {
      try {
        const mailOptions = {
          from: this.configService.get<string>('MAIL_FROM', 'ProxyHub <noreply@proxyhub.com>'),
          to,
          subject,
          text,
          html,
        };

        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`✅ 邮件发送成功（主邮箱）: ${info.messageId}`);
        return true;
      } catch (error) {
        this.logger.warn(`主邮箱发送失败: ${error.message}，尝试备用邮箱...`);
      }
    }

    // 主邮箱失败，尝试备用邮箱
    if (this.backupTransporter) {
      try {
        const mailOptions = {
          from: this.configService.get<string>('MAIL_FROM_BACKUP', 'ProxyHub <noreply@proxyhub.com>'),
          to,
          subject,
          text,
          html,
        };

        const info = await this.backupTransporter.sendMail(mailOptions);
        this.logger.log(`✅ 邮件发送成功（备用邮箱）: ${info.messageId}`);
        return true;
      } catch (error) {
        this.logger.error(`备用邮箱发送失败: ${error.message}`, error.stack);
      }
    }

    this.logger.error('所有邮箱均发送失败');
    return false;
  }

  async sendNotification(
    to: string,
    subject: string,
    content: string,
    data?: any,
  ): Promise<boolean> {
    if (!this.transporter && !this.backupTransporter) {
      this.logger.warn('所有邮件服务均未配置，跳过发送');
      return false;
    }

    const html = this.generateEmailHtml(subject, content, data);

    // 尝试主邮箱发送
    if (this.transporter) {
      try {
        const mailOptions = {
          from: this.configService.get<string>('MAIL_FROM', 'ProxyHub <noreply@proxyhub.com>'),
          to,
          subject,
          html,
        };

        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`✅ 通知邮件发送成功（主邮箱）: ${info.messageId}`);
        return true;
      } catch (error) {
        this.logger.warn(`主邮箱发送失败: ${error.message}，尝试备用邮箱...`);
      }
    }

    // 主邮箱失败，尝试备用邮箱
    if (this.backupTransporter) {
      try {
        const mailOptions = {
          from: this.configService.get<string>('MAIL_FROM_BACKUP', 'ProxyHub <noreply@proxyhub.com>'),
          to,
          subject,
          html,
        };

        const info = await this.backupTransporter.sendMail(mailOptions);
        this.logger.log(`✅ 通知邮件发送成功（备用邮箱）: ${info.messageId}`);
        return true;
      } catch (error) {
        this.logger.error(`备用邮箱发送失败: ${error.message}`, error.stack);
      }
    }

    this.logger.error('所有邮箱均发送失败');
    return false;
  }

  private generateEmailHtml(subject: string, content: string, data?: any): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.8;
      color: #333333;
    }
    .content h2 {
      color: #667eea;
      font-size: 22px;
      margin-bottom: 20px;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
    }
    .data-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .data-box strong {
      color: #667eea;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      border-top: 1px solid #e9ecef;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background-color: #764ba2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ProxyHub</h1>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      <p>${content}</p>
      ${data ? `
        <div class="data-box">
          ${Object.entries(data).map(([key, value]) => `
            <p><strong>${key}:</strong> ${value}</p>
          `).join('')}
        </div>
      ` : ''}
      <p style="margin-top: 30px;">
        <a href="http://localhost:8080" class="button">访问ProxyHub</a>
      </p>
    </div>
    <div class="footer">
      <p>此邮件由ProxyHub系统自动发送，请勿回复。</p>
      <p>如有疑问，请联系客服：<a href="https://t.me/leyiproxy" style="color: #667eea;">@leyiproxy</a></p>
      <p>&copy; 2025 ProxyHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  // 订单通知邮件
  async sendOrderNotification(to: string, orderData: any): Promise<boolean> {
    return this.sendNotification(
      to,
      '订单确认 - ProxyHub',
      '您的订单已成功创建！',
      {
        '订单号': orderData.orderNo,
        '商品': orderData.productType,
        '金额': `$${orderData.amount}`,
        '状态': orderData.status === 'completed' ? '已完成' : '处理中',
      },
    );
  }

  // 充值通知邮件
  async sendRechargeNotification(to: string, rechargeData: any): Promise<boolean> {
    return this.sendNotification(
      to,
      '充值成功 - ProxyHub',
      '您的充值申请已通过审核！',
      {
        '充值金额': `$${rechargeData.amount}`,
        '当前余额': `$${rechargeData.balance}`,
      },
    );
  }

  // 到期提醒邮件
  async sendExpiringNotification(to: string, proxyData: any): Promise<boolean> {
    return this.sendNotification(
      to,
      'IP即将到期提醒 - ProxyHub',
      `您的代理IP即将在${proxyData.daysLeft}天后到期，请及时续费！`,
      {
        'IP地址': proxyData.ip,
        '到期时间': proxyData.expiresAt,
      },
    );
  }

  // 余额不足提醒
  async sendBalanceLowNotification(to: string, balance: number): Promise<boolean> {
    return this.sendNotification(
      to,
      '余额不足提醒 - ProxyHub',
      '您的账户余额已不足$10，建议及时充值以免影响使用。',
      {
        '当前余额': `$${balance.toFixed(2)}`,
      },
    );
  }
}

