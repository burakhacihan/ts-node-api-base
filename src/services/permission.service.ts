import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Permission } from '../models/Permission';
import { RolePermission } from '../models/RolePermission';
import { User } from '../models/User';
import { IPermissionService } from '../interfaces/services/IPermissionService';
import { PermissionStatsDto, PermissionGroupDto, RoutePermissionDto } from '../dtos/permission';
import { IUserService } from '../interfaces/services/IUserService';

@injectable()
export class PermissionService implements IPermissionService {
  private readonly permissionRepo: Repository<Permission>;
  private readonly rolePermissionRepo: Repository<RolePermission>;
  private readonly userRepo: Repository<User>;
  private readonly cache: Map<string, string> = new Map();
  private readonly userService: IUserService;

  constructor(@inject('UserService') userService: IUserService) {
    this.permissionRepo = AppDataSource.getRepository(Permission);
    this.rolePermissionRepo = AppDataSource.getRepository(RolePermission);
    this.userRepo = AppDataSource.getRepository(User);
    this.userService = userService;
  }

  async getAction(method: string, route: string): Promise<string | null> {
    const key = `${method}:${route}`;
    if (this.cache.has(key)) {
      const cachedAction = this.cache.get(key);
      return cachedAction || null;
    }

    // First try exact match
    let permission = await this.permissionRepo.findOne({ where: { method, route } });

    // If no exact match, try pattern matching for dynamic routes
    if (!permission) {
      permission = await this.findPermissionByPattern(method, route);
    }

    if (permission) {
      this.cache.set(key, permission.action);
      return permission.action;
    }

    this.cache.set(key, '');
    return null;
  }

  /**
   * Finds permission by pattern matching (for dynamic routes)
   */
  private async findPermissionByPattern(method: string, route: string): Promise<Permission | null> {
    const permissions = await this.permissionRepo.find({ where: { method } });

    for (const permission of permissions) {
      if (this.matchesRoutePattern(route, permission.route)) {
        return permission;
      }
    }

    return null;
  }

  /**
   * Checks if a route matches a pattern (handles dynamic segments)
   */
  private matchesRoutePattern(actualRoute: string, patternRoute: string): boolean {
    // If exact match, return true
    if (actualRoute === patternRoute) {
      return true;
    }

    // Split routes into segments
    const actualSegments = actualRoute.split('/').filter(Boolean);
    const patternSegments = patternRoute.split('/').filter(Boolean);

    // If different number of segments, no match
    if (actualSegments.length !== patternSegments.length) {
      return false;
    }

    // Check each segment
    for (let i = 0; i < actualSegments.length; i++) {
      const actualSegment = actualSegments[i];
      const patternSegment = patternSegments[i];

      // If pattern segment starts with ':', it's a dynamic segment - always match
      if (patternSegment.startsWith(':')) {
        continue;
      }

      // Otherwise, segments must match exactly
      if (actualSegment !== patternSegment) {
        return false;
      }
    }

    return true;
  }

  async findOrCreatePermission(method: string, route: string, action: string): Promise<Permission> {
    let permission = await this.permissionRepo.findOne({ where: { method, route, action } });
    if (!permission) {
      permission = this.permissionRepo.create({ method, route, action });
      await this.permissionRepo.save(permission);
    }

    return permission;
  }

  /**
   * Find or create a permission record for internal/bootstrap use
   * This method bypasses validation and stores routes without API version prefix
   */
  async findOrCreatePermissionInternal(
    method: string,
    route: string,
    action: string,
  ): Promise<Permission> {
    // Ensure route doesn't have API version prefix for internal storage
    const normalizedRoute = this.normalizeRouteForStorage(route);

    let permission = await this.permissionRepo.findOne({
      where: { method, route: normalizedRoute, action },
    });

    if (!permission) {
      // Validate action format (should follow module:operation pattern)
      if (!action.includes(':') || action.split(':').length !== 2) {
        throw new Error('Action must follow the format "module:operation"');
      }

      permission = this.permissionRepo.create({ method, route: normalizedRoute, action });
      await this.permissionRepo.save(permission);
    }

    return permission;
  }

  /**
   * Normalize route for storage by removing API version prefix
   */
  private normalizeRouteForStorage(route: string): string {
    // Remove API version prefix if present (e.g., '/api/v1/users' -> '/users')
    const apiVersionMatch = route.match(/^\/api\/v\d+\//);
    if (apiVersionMatch) {
      return route.replace(apiVersionMatch[0], '/');
    }
    return route;
  }

  async getAllPermissions(): Promise<Permission[]> {
    const permissions = await this.permissionRepo.find({
      order: { createdAt: 'ASC' },
    });

    return permissions;
  }

  async getPermissionById(id: number): Promise<Permission | null> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    return permission;
  }

  async getPermissionsWithFilters(
    filters: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ permissions: Permission[]; total: number }> {
    const queryBuilder = this.permissionRepo.createQueryBuilder('permission');

    // Apply filters
    if (filters.method) {
      queryBuilder.andWhere('permission.method = :method', { method: filters.method });
    }

    if (filters.action) {
      queryBuilder.andWhere('permission.action LIKE :action', { action: `%${filters.action}%` });
    }

    if (filters.module) {
      queryBuilder.andWhere('permission.action LIKE :module', { module: `${filters.module}:%` });
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'ASC';
    queryBuilder.orderBy(`permission.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [permissions, total] = await queryBuilder.getManyAndCount();

    return { permissions, total };
  }

  async getPermissionsGrouped(): Promise<PermissionGroupDto[]> {
    const permissions = await this.permissionRepo.find({
      order: { action: 'ASC' },
    });

    const grouped = permissions.reduce(
      (acc, permission) => {
        const module = permission.action.split(':')[0] || 'unknown';

        if (!acc[module]) {
          acc[module] = {
            module,
            permissions: [],
            count: 0,
          };
        }

        acc[module].permissions.push(permission);
        acc[module].count++;

        return acc;
      },
      {} as Record<string, PermissionGroupDto>,
    );

    const result = Object.values(grouped);

    return result;
  }

  async getPermissionsByRoute(): Promise<RoutePermissionDto[]> {
    // First get all permissions
    const permissions = await this.permissionRepo.find({
      order: { route: 'ASC', method: 'ASC' },
    });

    // Then get role permissions for each permission
    const routePermissions = await Promise.all(
      permissions.map(async (permission) => {
        const rolePermissions = await this.rolePermissionRepo.find({
          where: { permission: { id: permission.id } },
          relations: ['role'],
        });

        const roles = rolePermissions.map((rp) => rp.role.name);
        const description = this.generateRouteDescription(
          permission.method,
          permission.route,
          permission.action,
        );

        return new RoutePermissionDto({
          route: permission.route,
          method: permission.method,
          action: permission.action,
          description,
          roles,
        });
      }),
    );

    return routePermissions;
  }

  async getPermissionStats(): Promise<PermissionStatsDto> {
    const permissions = await this.permissionRepo.find();
    const rolePermissions = await this.rolePermissionRepo.find({
      relations: ['permission', 'role'],
    });

    // Group by method
    const permissionsByMethod = permissions.reduce(
      (acc, permission) => {
        acc[permission.method] = (acc[permission.method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Group by module
    const permissionsByModule = permissions.reduce(
      (acc, permission) => {
        const module = permission.action.split(':')[0] || 'unknown';
        acc[module] = (acc[module] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Count unused permissions
    const usedPermissionIds = new Set(rolePermissions.map((rp) => rp.permission.id));
    const unusedPermissions = permissions.filter((p) => !usedPermissionIds.has(p.id)).length;

    // Get usage statistics
    const usageStats = await this.getPermissionUsageStats();

    const stats = new PermissionStatsDto({
      totalPermissions: permissions.length,
      permissionsByMethod,
      permissionsByModule,
      unusedPermissions,
      mostUsedPermissions: usageStats.slice(0, 10),
      leastUsedPermissions: usageStats.slice(-10).reverse(),
    });

    return stats;
  }

  async validateUserPermission(userId: string, method: string, action: string): Promise<boolean> {
    const userIdInt = await this.userService.findUserIdByPid(userId);
    if (!userIdInt) {
      return false;
    }

    const user = await this.userRepo.findOne({
      where: { id: userIdInt },
      relations: ['roles'],
    });

    if (!user) {
      return false;
    }

    // Get role permissions for all user roles
    const roleIds = user.roles.map((role) => role);

    const hasPermission = await this.rolePermissionRepo
      .createQueryBuilder('rolePermission')
      .innerJoin('rolePermission.role', 'role')
      .innerJoin('rolePermission.permission', 'permission')
      .where('role.id IN (:...roleIds)', { roleIds })
      .andWhere('permission.method = :method', { method })
      .andWhere('permission.action = :action', { action })
      .getExists();

    return hasPermission;
  }

  async getUnusedPermissions(): Promise<Permission[]> {
    const permissions = await this.permissionRepo.find();
    const rolePermissions = await this.rolePermissionRepo.find({
      relations: ['permission'],
    });

    const usedPermissionIds = new Set(rolePermissions.map((rp) => rp.permission.id));
    const unusedPermissions = permissions.filter((p) => !usedPermissionIds.has(p.id));

    return unusedPermissions;
  }

  async getPermissionUsageStats(): Promise<Array<{ action: string; count: number }>> {
    const rolePermissions = await this.rolePermissionRepo.find({
      relations: ['permission'],
    });

    const usageMap = new Map<string, number>();

    rolePermissions.forEach((rp) => {
      const action = rp.permission.action;
      usageMap.set(action, (usageMap.get(action) || 0) + 1);
    });

    const usageStats = Array.from(usageMap.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    return usageStats;
  }

  async createPermission(method: string, route: string, action: string): Promise<Permission> {
    // Check if permission already exists
    const existingPermission = await this.permissionRepo.findOne({
      where: { method, route, action },
    });

    if (existingPermission) {
      throw new Error('Permission already exists with the same method, route, and action');
    }

    // Validate action format (should follow module:operation pattern)
    if (!action.includes(':') || action.split(':').length !== 2) {
      throw new Error('Action must follow the format "module:operation"');
    }

    // Create and save the permission
    const permission = this.permissionRepo.create({ method, route, action });
    await this.permissionRepo.save(permission);

    // Clear cache for this method-route combination
    const cacheKey = `${method}:${route}`;
    this.cache.delete(cacheKey);

    return permission;
  }

  private generateRouteDescription(method: string, route: string, action: string): string {
    const resource = action.split(':')[0];
    const operation = action.split(':')[1];

    switch (method) {
      case 'GET':
        return `Retrieve ${resource} data`;
      case 'POST':
        return `Create new ${resource}`;
      case 'PUT':
      case 'PATCH':
        return `Update ${resource} data`;
      case 'DELETE':
        return `Delete ${resource}`;
      default:
        return `${method} operation on ${resource}`;
    }
  }
}
