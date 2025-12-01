import { Role } from '../../models/Role';
import { Permission } from '../../models/Permission';
import { RolePermission } from '../../models/RolePermission';

/**
 * RolePermission service interface defining all role-permission relationship operations
 */
export interface IRolePermissionService {
  /**
   * Grant a permission to a role
   * @param role - The role to grant permission to
   * @param permission - The permission to grant
   * @returns Promise<void>
   */
  grantPermissionToRole(role: Role, permission: Permission): Promise<void>;

  /**
   * Get all permissions for a specific role
   * @param roleId - Role ID
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Promise<{ permissions: Permission[]; total: number }>
   */
  getRolePermissions(
    roleId: number,
    page?: number,
    limit?: number,
  ): Promise<{ permissions: Permission[]; total: number }>;

  /**
   * Assign permissions to a role
   * @param roleId - Role ID
   * @param permissionIds - Array of permission IDs
   * @param replace - Whether to replace existing permissions
   * @returns Promise<void>
   */
  assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
    replace?: boolean,
  ): Promise<void>;

  /**
   * Remove permissions from a role
   * @param roleId - Role ID
   * @param permissionIds - Array of permission IDs
   * @returns Promise<void>
   */
  removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<void>;

  /**
   * Get all roles that have a specific permission
   * @param permissionId - Permission ID
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Promise<{ roles: Role[]; total: number }>
   */
  getPermissionRoles(
    permissionId: number,
    page?: number,
    limit?: number,
  ): Promise<{ roles: Role[]; total: number }>;

  /**
   * Check if a role has a specific permission
   * @param roleId - Role ID
   * @param permissionId - Permission ID
   * @returns Promise<boolean>
   */
  hasPermission(roleId: number, permissionId: number): Promise<boolean>;

  /**
   * Get role-permission assignment by ID
   * @param assignmentId - Assignment ID
   * @returns Promise<RolePermission | null>
   */
  getAssignmentById(assignmentId: number): Promise<RolePermission | null>;

  /**
   * Remove a specific role-permission assignment
   * @param assignmentId - Assignment ID
   * @returns Promise<void>
   */
  removeAssignment(assignmentId: number): Promise<void>;
}
