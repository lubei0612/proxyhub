import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '赠送金额' })
  gift_balance: number;

  @Column({ name: 'api_key', unique: true, nullable: true })
  @Index()
  apiKey: string;

  @Column({ name: 'proxy_985_zone', nullable: true, comment: '985代理通道标识' })
  proxy985Zone: string;

  @Column({ name: 'referral_code', unique: true, nullable: true })
  @Index()
  referralCode: string;

  @Column({ name: 'referred_by', nullable: true })
  referredBy: string;

  @Column({ name: 'is_agent', default: false })
  isAgent: boolean;

  @Column({ name: 'agent_commission_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  agentCommissionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '可提现佣金' })
  commission_balance: number;

  @Column({ name: 'telegram_username', nullable: true })
  telegramUsername: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, length: 100 })
  nickname: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}




