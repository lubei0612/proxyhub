import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notification_settings')
export class NotificationSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @ManyToOne(() => User)
  user: User;

  // 邮件通知设置
  @Column({ name: 'email_enabled', default: true })
  emailEnabled: boolean;

  @Column({ name: 'email_on_order', default: true })
  emailOnOrder: boolean;

  @Column({ name: 'email_on_recharge', default: true })
  emailOnRecharge: boolean;

  @Column({ name: 'email_on_expiring', default: true })
  emailOnExpiring: boolean;

  @Column({ name: 'email_on_balance_low', default: true })
  emailOnBalanceLow: boolean;

  // 站内通知设置
  @Column({ name: 'in_app_enabled', default: true })
  inAppEnabled: boolean;

  @Column({ name: 'in_app_on_order', default: true })
  inAppOnOrder: boolean;

  @Column({ name: 'in_app_on_recharge', default: true })
  inAppOnRecharge: boolean;

  @Column({ name: 'in_app_on_expiring', default: true })
  inAppOnExpiring: boolean;

  @Column({ name: 'in_app_on_balance_low', default: true })
  inAppOnBalanceLow: boolean;

  // Telegram通知设置
  @Column({ name: 'telegram_enabled', default: false })
  telegramEnabled: boolean;

  @Column({ name: 'telegram_chat_id', nullable: true })
  telegramChatId: string;

  @Column({ name: 'telegram_username', nullable: true })
  telegramUsername: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


