import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PriceConfig } from './price-config.entity';

@Entity('price_overrides')
export class PriceOverride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'price_config_id' })
  priceConfigId: number;

  @ManyToOne(() => PriceConfig, (config) => config.overrides)
  @JoinColumn({ name: 'price_config_id' })
  priceConfig: PriceConfig;

  @Column({ name: 'country_code', length: 10 })
  countryCode: string;

  @Column({ name: 'city_name', length: 100, nullable: true })
  cityName: string;

  @Column({ name: 'override_price', type: 'decimal', precision: 10, scale: 2 })
  overridePrice: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

