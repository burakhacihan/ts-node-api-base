import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IPermissionService } from '../interfaces/services/IPermissionService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../core/constants/http-status';
import {
  PermissionResponseDto,
  PermissionStatsDto,
  PermissionValidationRequestDto,
  PermissionValidationResponseDto,
  PermissionCreationRequestDto,
} from '../dtos/permission';

@injectable()
export class PermissionController {
  private readonly permissionService: IPermissionService;

  constructor(@inject('PermissionService') permissionService: IPermissionService) {
    this.permissionService = permissionService;
  }

  async getAllPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, method, action, module, sortBy, sortOrder } = req.query;

      const filters = { method, action, module, sortBy, sortOrder };
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;

      const { permissions, total } = await this.permissionService.getPermissionsWithFilters(
        filters,
        pageNum,
        limitNum,
      );

      const permissionDtos = PermissionResponseDto.fromEntities(permissions);

      res.status(HttpStatusCode.OK).json(
        ApiResponse(
          {
            permissions: permissionDtos,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total,
              pages: Math.ceil(total / limitNum),
            },
          },
          'Permissions retrieved successfully',
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getPermissionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as unknown as number;

      const permission = await this.permissionService.getPermissionById(id);

      if (!permission) {
        res.status(HttpStatusCode.NOT_FOUND).json(ApiResponse(null, 'Permission not found', false));
        return;
      }

      const permissionDto = PermissionResponseDto.fromEntity(permission);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(permissionDto, 'Permission retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getPermissionsGrouped(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groupedPermissions = await this.permissionService.getPermissionsGrouped();

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(groupedPermissions, 'Grouped permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getPermissionsByRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const routePermissions = await this.permissionService.getPermissionsByRoute();

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(routePermissions, 'Route permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async validatePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, method, action } = req.body as PermissionValidationRequestDto;

      const hasPermission = await this.permissionService.validateUserPermission(
        userId,
        method,
        action,
      );

      const response = new PermissionValidationResponseDto({
        hasPermission,
        userRoles: [], // TODO: Get user roles from service
        requiredPermission: `${method}:${action}`,
        grantedPermissions: [], // TODO: Get granted permissions from service
      });

      res.status(HttpStatusCode.OK).json(ApiResponse(response, 'Permission validation completed'));
    } catch (error) {
      next(error);
    }
  }

  async getPermissionStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.permissionService.getPermissionStats();

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(stats, 'Permission statistics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUnusedPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unusedPermissions = await this.permissionService.getUnusedPermissions();
      const permissionDtos = PermissionResponseDto.fromEntities(unusedPermissions);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(permissionDtos, 'Unused permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getPermissionUsageStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usageStats = await this.permissionService.getPermissionUsageStats();

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(usageStats, 'Permission usage statistics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getPermissionAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [stats, unusedPermissions, usageStats, groupedPermissions] = await Promise.all([
        this.permissionService.getPermissionStats(),
        this.permissionService.getUnusedPermissions(),
        this.permissionService.getPermissionUsageStats(),
        this.permissionService.getPermissionsGrouped(),
      ]);

      const analysis = {
        overview: stats,
        unusedPermissions: PermissionResponseDto.fromEntities(unusedPermissions),
        usageStatistics: usageStats,
        moduleBreakdown: groupedPermissions,
        recommendations: this.generateRecommendations(stats, unusedPermissions.length, usageStats),
      };

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(analysis, 'Permission analysis completed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { method, route, action } = req.body as PermissionCreationRequestDto;

      const permission = await this.permissionService.createPermission(method, route, action);
      const permissionDto = PermissionResponseDto.fromEntity(permission);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse(permissionDto, 'Permission created successfully'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(HttpStatusCode.CONFLICT).json(ApiResponse(null, error.message, false));
        return;
      }

      if (
        error instanceof Error &&
        (error.message.includes('Route must start with /api/') ||
          error.message.includes('Action must follow the format'))
      ) {
        res.status(HttpStatusCode.BAD_REQUEST).json(ApiResponse(null, error.message, false));
        return;
      }

      next(error);
    }
  }

  private generateRecommendations(
    stats: PermissionStatsDto,
    unusedCount: number,
    usageStats: Array<{ action: string; count: number }>,
  ): string[] {
    const recommendations: string[] = [];

    if (unusedCount > 0) {
      recommendations.push(
        `Consider removing ${unusedCount} unused permissions to clean up the system.`,
      );
    }

    if (stats.unusedPermissions > stats.totalPermissions * 0.2) {
      recommendations.push('More than 20% of permissions are unused. Consider a permission audit.');
    }

    const lowUsagePermissions = usageStats.filter((stat) => stat.count <= 1);
    if (lowUsagePermissions.length > 0) {
      recommendations.push(
        `Found ${lowUsagePermissions.length} permissions with minimal usage. Review if they are necessary.`,
      );
    }

    const modules = Object.keys(stats.permissionsByModule);
    if (modules.length > 10) {
      recommendations.push(
        'Consider consolidating permissions across modules for better maintainability.',
      );
    }

    return recommendations;
  }
}
