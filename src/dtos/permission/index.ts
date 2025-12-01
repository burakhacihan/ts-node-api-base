import { Permission } from '../../models/Permission';

/**
 * Permission response DTO
 */
export class PermissionResponseDto {
  id: number;
  method: string;
  route: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<PermissionResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from Permission entity
   */
  static fromEntity(permission: Permission): PermissionResponseDto {
    return new PermissionResponseDto({
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
  static fromEntities(permissions: Permission[]): PermissionResponseDto[] {
    return permissions.map((permission) => PermissionResponseDto.fromEntity(permission));
  }
}

/**
 * Permission statistics DTO
 */
export class PermissionStatsDto {
  totalPermissions: number;
  permissionsByMethod: Record<string, number>;
  permissionsByModule: Record<string, number>;
  unusedPermissions: number;
  mostUsedPermissions: Array<{ action: string; count: number }>;
  leastUsedPermissions: Array<{ action: string; count: number }>;

  constructor(data: Partial<PermissionStatsDto>) {
    Object.assign(this, data);
  }
}

/**
 * Permission validation request DTO
 */
export class PermissionValidationRequestDto {
  userId: string;
  method: string;
  action: string;

  constructor(data: Partial<PermissionValidationRequestDto>) {
    Object.assign(this, data);
  }
}

/**
 * Permission validation response DTO
 */
export class PermissionValidationResponseDto {
  hasPermission: boolean;
  userRoles: string[];
  requiredPermission: string;
  grantedPermissions: string[];

  constructor(data: Partial<PermissionValidationResponseDto>) {
    Object.assign(this, data);
  }
}

/**
 * Permission grouping DTO
 */
export class PermissionGroupDto {
  module: string;
  permissions: PermissionResponseDto[];
  count: number;

  constructor(data: Partial<PermissionGroupDto>) {
    Object.assign(this, data);
  }
}

/**
 * Route permission mapping DTO
 */
export class RoutePermissionDto {
  route: string;
  method: string;
  action: string;
  description: string;
  roles: string[];

  constructor(data: Partial<RoutePermissionDto>) {
    Object.assign(this, data);
  }
}

/**
 * Permission creation request DTO
 */
export class PermissionCreationRequestDto {
  method: string;
  route: string;
  action: string;

  constructor(data: Partial<PermissionCreationRequestDto>) {
    Object.assign(this, data);
  }
}
