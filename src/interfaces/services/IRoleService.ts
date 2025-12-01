import { Role } from '../../models/Role';

/**
 * Role service interface defining all role-related operations
 */
export interface IRoleService {
  /**
   * Find a role by its name
   * @param name - Role name
   * @returns Promise<Role | null> - Role or null if not found
   */
  findByName(name: string): Promise<Role | null>;

  /**
   * Find a role by its ID
   * @param id - Role ID
   * @returns Promise<Role | null> - Role or null if not found
   */
  findById(id: number): Promise<Role | null>;

  /**
   * Get all roles with pagination and filtering
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param search - Search term for role name or description
   * @returns Promise<{ roles: Role[], total: number, page: number, limit: number }>
   */
  getAllRoles(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{
    roles: Role[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Create a new role
   * @param name - Role name
   * @param description - Role description (optional)
   * @returns Promise<Role> - The created role
   */
  createRole(name: string, description?: string): Promise<Role>;

  /**
   * Update an existing role
   * @param id - Role ID
   * @param name - New role name
   * @param description - New role description (optional)
   * @returns Promise<Role> - The updated role
   */
  updateRole(id: number, name: string, description?: string): Promise<Role>;

  /**
   * Delete a role
   * @param id - Role ID
   * @returns Promise<boolean> - True if deleted successfully
   */
  deleteRole(id: number): Promise<boolean>;

  /**
   * Check if a role is assigned to any users
   * @param id - Role ID
   * @returns Promise<boolean> - True if role is assigned to users
   */
  isRoleAssignedToUsers(id: number): Promise<boolean>;
}
