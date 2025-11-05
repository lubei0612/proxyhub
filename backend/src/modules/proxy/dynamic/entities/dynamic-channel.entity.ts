import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../user/entities/user.entity';

@Entity('dynamic_channels')
export class DynamicChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ name: 'channel_name', length: 100 })
  channelName: string;

  @Column({
    name: 'price_per_gb',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 4.5,
  })
  pricePerGb: number;

  @Column({ name: 'concurrent_limit', default: 1000 })
  concurrentLimit: number;

  @Column({ length: 20, default: 'active' })
  status: string; // 'active', 'paused', 'disabled'

  @Column({
    name: 'total_traffic',
    type: 'decimal',
    precision: 15,
    scale: 3,
    default: 0,
  })
  totalTraffic: number;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalCost: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


