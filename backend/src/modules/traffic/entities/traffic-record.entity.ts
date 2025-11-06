import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StaticProxy } from '../../proxy/static/entities/static-proxy.entity';

/**
 * 流量记录实体
 * 用于记录每个IP的流量使用情况
 */
@Entity('traffic_records')
@Index('idx_user_date', ['userId', 'recordDate'])
@Index('idx_proxy_date', ['proxyId', 'recordDate'])
export class TrafficRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'proxy_id', nullable: true })
  proxyId: number;

  @ManyToOne(() => StaticProxy, { nullable: true })
  @JoinColumn({ name: 'proxy_id' })
  proxy: StaticProxy;

  @Column({ name: 'proxy_type', length: 50 })
  proxyType: string; // 'static_residential', 'dynamic_residential', 'datacenter', 'mobile'

  @Column({ name: 'record_date', type: 'date' })
  @Index()
  recordDate: Date; // 记录日期（UTC）

  @Column({ name: 'requests_total', type: 'bigint', default: 0 })
  requestsTotal: number; // 总请求数

  @Column({ name: 'requests_success', type: 'bigint', default: 0 })
  requestsSuccess: number; // 成功请求数

  @Column({ name: 'requests_failed', type: 'bigint', default: 0 })
  requestsFailed: number; // 失败请求数

  @Column({ name: 'traffic_upload', type: 'decimal', precision: 15, scale: 3, default: 0 })
  trafficUpload: number; // 上传流量（GB）

  @Column({ name: 'traffic_download', type: 'decimal', precision: 15, scale: 3, default: 0 })
  trafficDownload: number; // 下载流量（GB）

  @Column({ name: 'traffic_total', type: 'decimal', precision: 15, scale: 3, default: 0 })
  trafficTotal: number; // 总流量（GB）

  @Column({ name: 'protocol_http', type: 'bigint', default: 0 })
  protocolHttp: number; // HTTP请求数

  @Column({ name: 'protocol_https', type: 'bigint', default: 0 })
  protocolHttps: number; // HTTPS请求数

  @Column({ name: 'protocol_websocket', type: 'bigint', default: 0 })
  protocolWebsocket: number; // WebSocket请求数

  @Column({ name: 'protocol_other', type: 'bigint', default: 0 })
  protocolOther: number; // 其他协议请求数

  @Column({ type: 'text', nullable: true })
  remark: string; // 备注

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

