import { UserRoleResponseDto, UserWithRolesDto } from '../../dtos/userRole';

/**
 * UserRole service interface defining all user-role relationship operations
 */
export interface IUserRoleService {
  /**
   * Assign a role to a user
   * @param userId - The user ID
   * @param roleId - The role ID
   * @param assignedBy - The ID of the user assigning the role (optional)
   * @returns Promise<UserRoleResponseDto> - The created user role assignment
   */
  assignRole(userId: string, roleId: number, assignedBy?: number): Promise<UserRoleResponseDto>;

  /**
   * Remove a role from a user
   * @param userId - The user ID
   * @param roleId - The role ID
   * @returns Promise<boolean> - True if role was removed successfully
   */
  removeRole(userId: string, roleId: number): Promise<boolean>;

  /**
   * Get all roles assigned to a user
   * @param userId - The user ID
   * @returns Promise<UserRoleResponseDto[]> - Array of user role assignments
   */
  getUserRoles(userId: string): Promise<UserRoleResponseDto[]>;

  /**
   * Get all users assigned to a role
   * @param roleId - The role ID
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Promise<{ users: UserWithRolesDto[]; total: number }>
   */
  getRoleUsers(
    roleId: number,
    page?: number,
    limit?: number,
  ): Promise<{ users: UserWithRolesDto[]; total: number }>;

  /**
   * Check if a user has a specific role
   * @param userId - The user ID
   * @param roleId - The role ID
   * @returns Promise<boolean> - True if user has the role
   */
  userHasRole(userId: string, roleId: number): Promise<boolean>;

  /**
   * Get user role assignment by ID
   * @param id - The user role assignment ID
   * @returns Promise<UserRoleResponseDto | null> - The user role assignment or null
   */
  getUserRoleById(id: number): Promise<UserRoleResponseDto | null>;

  /**
   * Get role statistics
   * @param roleId - The role ID
   * @returns Promise<{ totalUsers: number; activeUsers: number }>
   */
  getRoleStats(roleId: number): Promise<{ totalUsers: number; activeUsers: number }>;
}
