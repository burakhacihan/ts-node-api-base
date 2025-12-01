import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './Base';
import { RolePermission } from './RolePermission';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column()
  method: string; // 'GET', 'POST', etc.

  @Column()
  route: string; // Express-style, e.g., '/users/:id/ban'

  @Column()
  action: string; // e.g., 'user:ban'

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[];
}
