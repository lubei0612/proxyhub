import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'from_currency', length: 10 })
  fromCurrency: string;

  @Column({ name: 'to_currency', length: 10 })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  rate: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

