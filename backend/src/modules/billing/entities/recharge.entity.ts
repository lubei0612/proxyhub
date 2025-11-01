import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('recharges')
export class Recharge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_no', unique: true, length: 50 })
  orderNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', length: 50 })
  paymentMethod: string; // 'alipay' | 'wechat' | 'bank'
  
  @Column({ length: 50, nullable: true })
  method: string; // Alias for paymentMethod for compatibility

  @Column({ length: 20, default: 'pending' })
  status: string; // 'pending' | 'approved' | 'rejected'

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'admin_remark', type: 'text', nullable: true })
  adminRemark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Export enum types
export enum RechargeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

