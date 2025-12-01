import { RolePermission } from '../../models/RolePermission';
import { Role } from '../../models/Role';
import { Permission } from '../../models/Permission';

/**
 * Role-Permission assignment response DTO
 */
export class RolePermissionResponseDto {
  id: number;
  roleId: number;
  roleName: string;
  permissionId: number;
  permissionAction: string;
  permissionMethod: string;
  permissionRoute: string;
  assignedAt: Date;

  constructor(data: Partial<RolePermissionResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from RolePermission entity
   */
  static fromEntity(rolePermission: RolePermission): RolePermissionResponseDto {
    return new RolePermissionResponseDto({
      id: rolePermission.id,
      roleId: rolePermission.role.id,
      roleName: rolePermission.role.name,
      permissionId: rolePermission.permission.id,
      permissionAction: rolePermission.permission.action,
      permissionMethod: rolePermission.permission.method,
      permissionRoute: rolePermission.permission.route,
      assignedAt: rolePermission.createdAt,
    });
  }

  /**
   * Static method to create DTO array from RolePermission entities
   */
  static fromEntities(rolePermissions: RolePermission[]): RolePermissionResponseDto[] {
    return rolePermissions.map((rp) => RolePermissionResponseDto.fromEntity(rp));
  }
}

/**
 * Permission DTO for role-permission operations
 */
export class PermissionDto {
  id: number;
  method: string;
  route: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<PermissionDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from Permission entity
   */
  static fromEntity(permission: Permission): PermissionDto {
    return new PermissionDto({
      id: permission.id,
      method: permission.method,
      route: permission.route,
      action: permission.action,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    });
  }

  /**
   * Static method to create DTO array from Permission entities
   */
  static fromEntities(permissions: Permission[]): PermissionDto[] {
    return permissions.map((p) => PermissionDto.fromEntity(p));
  }
}

/**
 * Role DTO for permission-role operations
 */
export class RoleDto {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<RoleDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from Role entity
   */
  static fromEntity(role: Role): RoleDto {
    return new RoleDto({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }

  /**
   * Static method to create DTO array from Role entities
   */
  static fromEntities(roles: Role[]): RoleDto[] {
    return roles.map((r) => RoleDto.fromEntity(r));
  }
}
