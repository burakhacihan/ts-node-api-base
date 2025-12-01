import { Permission } from '../../models/Permission';
import { PermissionStatsDto, PermissionGroupDto, RoutePermissionDto } from '../../dtos/permission';

/**
 * Permission service interface defining all permission-related operations
 */
export interface IPermissionService {
  /**
   * Get action string for a given HTTP method and route
   * @param method - HTTP method (GET, POST, etc.)
   * @param route - Express route path
   * @returns Promise<string | null> - Action string or null if not found
   */
  getAction(method: string, route: string): Promise<string | null>;

  /**
   * Find or create a permission record
   * @param method - HTTP method
   * @param route - Express route path
   * @param action - Action string
   * @returns Promise<Permission> - The permission record
   */
  findOrCreatePermission(method: string, route: string, action: string): Promise<Permission>;

  /**
   * Find or create a permission record for internal/bootstrap use
   * This method bypasses validation and stores routes without API version prefix
   * @param method - HTTP method
   * @param route - Express route path (will be normalized for storage)
   * @param action - Action string
   * @returns Promise<Permission> - The permission record
   */
  findOrCreatePermissionInternal(
    method: string,
    route: string,
    action: string,
  ): Promise<Permission>;

  /**
   * Create a new permission record
   * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param route - Express route path (must start with /api/)
   * @param action - Action string (e.g., 'user:create')
   * @returns Promise<Permission> - The created permission record
   * @throws Error if permission already exists or validation fails
   */
  createPermission(method: string, route: string, action: string): Promise<Permission>;

  /**
   * Get all permissions in the system
   * @returns Promise<Permission[]> - Array of all permissions
   */
  getAllPermissions(): Promise<Permission[]>;

  /**
   * Get permission by ID
   * @param id - Permission ID
   * @returns Promise<Permission | null> - Permission or null if not found
   */
  getPermissionById(id: number): Promise<Permission | null>;

  /**
   * Get permissions with filtering and pagination
   * @param filters - Filter criteria
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise<{ permissions: Permission[]; total: number }> - Paginated permissions
   */
  getPermissionsWithFilters(
    filters: any,
    page: number,
    limit: number,
  ): Promise<{ permissions: Permission[]; total: number }>;

  /**
   * Get permissions grouped by module/feature
   * @returns Promise<PermissionGroupDto[]> - Grouped permissions
   */
  getPermissionsGrouped(): Promise<PermissionGroupDto[]>;

  /**
   * Get permissions organized by route structure
   * @returns Promise<RoutePermissionDto[]> - Route-based permissions
   */
  getPermissionsByRoute(): Promise<RoutePermissionDto[]>;

  /**
   * Get permission statistics
   * @returns Promise<PermissionStatsDto> - Permission statistics
   */
  getPermissionStats(): Promise<PermissionStatsDto>;

  /**
   * Validate if a user has specific permissions
   * @param userId - User ID
   * @param method - HTTP method
   * @param action - Action string
   * @returns Promise<boolean> - Whether user has permission
   */
  validateUserPermission(userId: string, method: string, action: string): Promise<boolean>;

  /**
   * Get unused permissions
   * @returns Promise<Permission[]> - Unused permissions
   */
  getUnusedPermissions(): Promise<Permission[]>;

  /**
   * Get permission usage statistics
   * @returns Promise<Array<{ action: string; count: number }>> - Usage statistics
   */
  getPermissionUsageStats(): Promise<Array<{ action: string; count: number }>>;
}
