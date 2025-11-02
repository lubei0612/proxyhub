import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PriceOverride } from './price-override.entity';

@Entity('price_configs')
export class PriceConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_type', unique: true, length: 50 })
  productType: string; // 'static_shared' 或 'static_premium'

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => PriceOverride, (override) => override.priceConfig)
  overrides: PriceOverride[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export enum ProductType {
  STATIC_SHARED = 'static_shared',
  STATIC_PREMIUM = 'static_premium',
}

