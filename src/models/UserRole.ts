import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './Base';
import { User } from './User';
import { Role } from './Role';

@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: true })
@Index(['userId'])
@Index(['roleId'])
@Index(['assignedBy'])
export class UserRole extends BaseEntity {
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ name: 'role_id', type: 'integer' })
  roleId: number;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ name: 'assigned_by', type: 'integer', nullable: true })
  assignedBy?: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by', referencedColumnName: 'id' })
  assignedByUser?: User;
}
