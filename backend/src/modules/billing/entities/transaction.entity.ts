import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'transaction_no', unique: true, length: 50 })
  transactionNo: string;

  @Column({ length: 20 })
  type: string; // 'recharge' | 'purchase' | 'refund' | 'commission'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'balance_before', type: 'decimal', precision: 10, scale: 2 })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// Export enum types
export enum TransactionType {
  RECHARGE = 'recharge',
  PURCHASE = 'purchase',
  RENEWAL = 'renewal',
  REFUND = 'refund',
  COMMISSION = 'commission',
  EXPENSE = 'expense',
  INCOME = 'income',
}

