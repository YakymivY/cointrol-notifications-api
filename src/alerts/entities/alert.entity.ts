import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column('decimal', {
    precision: 18,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  target_price: number;

  @Column({ type: 'enum', enum: ['above', 'below'] })
  direction: 'above' | 'below';

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  is_triggered: boolean;

  @CreateDateColumn()
  created_at: Date;
}
