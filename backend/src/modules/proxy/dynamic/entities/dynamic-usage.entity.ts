import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { DynamicChannel } from './dynamic-channel.entity';
import { User } from '../../../user/entities/user.entity';

@Entity('dynamic_usage')
@Unique(['channelId', 'date'])
export class DynamicUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'channel_id' })
  channelId: number;

  @ManyToOne(() => DynamicChannel)
  channel: DynamicChannel;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 0 })
  requests: number;

  @Column({
    name: 'success_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  successRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  traffic: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}


