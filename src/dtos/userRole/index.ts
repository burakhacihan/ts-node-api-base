import { UserRole } from '../../models/UserRole';
import { User } from '../../models/User';
import { Role } from '../../models/Role';

/**
 * UserRole response DTO
 */
export class UserRoleResponseDto {
  id: number;
  userId: string;
  roleId: number;
  assignedAt: Date;
  assignedBy?: string;
  roleName?: string;
  userName?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserRoleResponseDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from UserRole entity
   */
  static fromEntity(userRole: UserRole): UserRoleResponseDto {
    return new UserRoleResponseDto({
      id: userRole.id,
      userId: userRole.user?.pid || userRole.userId.toString(),
      roleId: userRole.roleId,
      assignedAt: userRole.assignedAt,
      assignedBy: userRole.assignedByUser?.pid,
      roleName: userRole.role?.name,
      userName: userRole.user ? `${userRole.user.firstName} ${userRole.user.lastName}` : undefined,
      createdAt: userRole.createdAt,
      updatedAt: userRole.updatedAt,
    });
  }

  /**
   * Static method to create DTO array from UserRole entities
   */
  static fromEntities(userRoles: UserRole[]): UserRoleResponseDto[] {
    return userRoles.map((userRole) => UserRoleResponseDto.fromEntity(userRole));
  }
}

/**
 * UserRole assignment request DTO
 */
export class UserRoleAssignmentDto {
  userId: string;
  roleId: string;
  assignedBy?: string;

  constructor(data: Partial<UserRoleAssignmentDto>) {
    Object.assign(this, data);
  }
}

/**
 * User with roles DTO
 */
export class UserWithRolesDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserWithRolesDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from User entity with roles
   */
  static fromEntity(user: User): UserWithRolesDto {
    return new UserWithRolesDto({
      id: user.pid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles.map((role) => role.name) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}

/**
 * Role with users DTO
 */
export class RoleWithUsersDto {
  id: number;
  name: string;
  description?: string;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<RoleWithUsersDto>) {
    Object.assign(this, data);
  }

  /**
   * Static method to create DTO from Role entity with user count
   */
  static fromEntity(role: Role, userCount: number): RoleWithUsersDto {
    return new RoleWithUsersDto({
      id: role.id,
      name: role.name,
      description: role.description,
      userCount,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }
}
