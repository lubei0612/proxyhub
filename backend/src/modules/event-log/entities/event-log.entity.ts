import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('event_logs')
export class EventLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'event_type', length: 50 })
  eventType: string; // 'login', 'purchase', 'recharge', etc.

  @Column({ name: 'event_content', type: 'text' })
  eventContent: string; // 事件详细内容

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 注意：没有 ip_address 和 device_info 字段（隐私保护）
}

export enum EventType {
  LOGIN = 'login',
  REGISTER = 'register',
  LOGOUT = 'logout',
  PURCHASE_STATIC = 'purchase_static',
  PURCHASE_DYNAMIC = 'purchase_dynamic',
  RECHARGE = 'recharge',
  RECHARGE_APPROVED = 'recharge_approved',
  RECHARGE_REJECTED = 'recharge_rejected',
  PASSWORD_CHANGE = 'password_change',
  PROFILE_UPDATE = 'profile_update',
}

