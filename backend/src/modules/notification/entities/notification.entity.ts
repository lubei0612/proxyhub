import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ length: 50 })
  type: string; // 'order', 'recharge', 'expiring', 'balance_low', 'system'

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ default: false })
  read: boolean;

  @Column({ name: 'sent_email', default: false })
  sentEmail: boolean;

  @Column({ name: 'sent_telegram', default: false })
  sentTelegram: boolean;

  @Column({ name: 'sent_in_app', default: true })
  sentInApp: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;
}


