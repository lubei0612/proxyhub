import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ProxyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  RELEASED = 'released',
}

@Entity('static_proxies')
export class StaticProxy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'proxy_985_id', comment: '985Proxy的代理ID' })
  @Index()
  proxy985Id: number;

  @Column()
  zone: string;

  @Column({ name: 'purpose_web', nullable: true })
  purposeWeb: string;

  @Column({ name: 'static_proxy_type', comment: 'shared或premium' })
  staticProxyType: string;

  @Column()
  @Index()
  ip: string;

  @Column()
  port: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ name: 'country_code' })
  countryCode: string;

  @Column({ name: 'city_name' })
  cityName: string;

  @Column({ name: 'expire_time_utc', type: 'timestamp' })
  expireTimeUtc: Date;

  @Column({ name: 'release_time_utc', type: 'timestamp', nullable: true })
  releaseTimeUtc: Date;

  @Column({ type: 'enum', enum: ProxyStatus, default: ProxyStatus.ACTIVE })
  status: ProxyStatus;

  @Column({ type: 'boolean', default: false, comment: '是否启用自动续费' })
  auto_renew: boolean;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'order_no', nullable: true })
  @Index()
  orderNo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}




