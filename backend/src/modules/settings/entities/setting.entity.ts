import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn({ length: 100 })
  key: string;

  @Column('text')
  value: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


