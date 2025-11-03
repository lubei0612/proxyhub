import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Order } from '../../../order/entities/order.entity';

@Entity('static_proxies')
export class StaticProxy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'channel_name', length: 100 })
  channelName: string;

  @Column({ length: 50 })
  ip: string;

  @Column()
  port: number;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 10 })
  country: string; // ISO 3166-1 alpha-2
  
  @Column({ name: 'country_code', length: 10, nullable: true })
  countryCode: string; // Alias for country

  @Column({ name: 'country_name', length: 100 })
  countryName: string;

  @Column({ name: 'city_name', length: 100, nullable: true })
  cityName: string;

  @Column({ name: 'ip_type', length: 20 })
  ipType: string; // 'normal' | 'native'

  @Column({ length: 20, default: 'active' })
  status: string; // 'active' | 'released' | 'expired'

  @Column({ name: 'expire_time_utc', type: 'timestamp' })
  expireTimeUtc: Date;

  @Column({ name: 'release_time_utc', type: 'timestamp', nullable: true })
  releaseTimeUtc: Date;
  
  @Column({ name: 'auto_renew', type: 'boolean', default: false })
  auto_renew: boolean;
  
  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Virtual field: IP:Port:Account:Password format
   * This field is computed and not stored in the database
   */
  get credentials(): string {
    return `${this.ip}:${this.port}:${this.username}:${this.password}`;
  }
}

// Export enum types
export enum ProxyStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
  EXPIRED = 'expired',
}

