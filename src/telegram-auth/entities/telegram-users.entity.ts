import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TelegramUsers {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  photo_url?: string;

  @Column({ type: 'bigint', nullable: true })
  auth_date?: number;

  @Column({ type: 'uuid' })
  user_id: string;
}
