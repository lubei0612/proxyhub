import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ length: 100, nullable: true })
  nickname: string;

  @Column({ length: 20, default: 'user' })
  role: string; // 'user' | 'admin'

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;
  
  @Column({ name: 'gift_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  gift_balance: number;

  @Column({ length: 20, default: 'active' })
  status: string; // 'active' | 'disabled'

  @Column({ length: 64, unique: true, nullable: true })
  apiKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

