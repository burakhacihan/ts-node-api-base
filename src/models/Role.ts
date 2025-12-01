import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './Base';
import { UserRole } from './UserRole';
import { RolePermission } from './RolePermission';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role, {
    cascade: true,
    eager: false,
  })
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
    cascade: true,
    eager: false,
  })
  rolePermissions: RolePermission[];
}
