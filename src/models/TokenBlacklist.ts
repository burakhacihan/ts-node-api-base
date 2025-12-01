import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './Base';

@Entity('token_blacklist')
@Index(['token'], { unique: true })
@Index(['expiresAt'])
export class TokenBlacklist extends BaseEntity {
  @Column({ unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  userId: number;

  @Column({ nullable: true })
  reason: string;
}
