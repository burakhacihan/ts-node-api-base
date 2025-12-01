import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IRolePermissionService } from '../interfaces/services/IRolePermissionService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../core/constants/http-status';
import { createLogger, ILogger } from '../infrastructure/logging';
import { RolePermissionResponseDto, PermissionDto, RoleDto } from '../dtos/rolePermission';

@injectable()
export class RolePermissionController {
  private readonly rolePermissionService: IRolePermissionService;

  constructor(@inject('RolePermissionService') rolePermissionService: IRolePermissionService) {
    this.rolePermissionService = rolePermissionService;
  }

  /**
   * Get all permissions for a specific role
   */
  async getRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.rolePermissionService.getRolePermissions(
        parseInt(roleId),
        Number(page),
        Number(limit),
      );

      const permissions = PermissionDto.fromEntities(result.permissions);

      res.status(HttpStatusCode.OK).json(
        ApiResponse(
          {
            permissions,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: result.total,
              totalPages: Math.ceil(result.total / Number(limit)),
            },
          },
          'Role permissions retrieved successfully',
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissionsToRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId } = req.params;
      const { permissionIds, replace = false } = req.body;

      await this.rolePermissionService.assignPermissionsToRole(
        parseInt(roleId),
        permissionIds,
        replace,
      );

      res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Permissions assigned successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove permissions from a role
   */
  async removePermissionsFromRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;

      await this.rolePermissionService.removePermissionsFromRole(parseInt(roleId), permissionIds);

      res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Permissions removed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all roles that have a specific permission
   */
  async getPermissionRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { permissionId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.rolePermissionService.getPermissionRoles(
        parseInt(permissionId),
        Number(page),
        Number(limit),
      );

      const roles = RoleDto.fromEntities(result.roles);

      res.status(HttpStatusCode.OK).json(
        ApiResponse(
          {
            roles,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: result.total,
              totalPages: Math.ceil(result.total / Number(limit)),
            },
          },
          'Permission roles retrieved successfully',
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId, permissionId } = req.params;

      const hasPermission = await this.rolePermissionService.hasPermission(
        parseInt(roleId),
        parseInt(permissionId),
      );

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse({ hasPermission }, 'Permission check completed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get role-permission assignment by ID
   */
  async getAssignmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;

      const assignment = await this.rolePermissionService.getAssignmentById(parseInt(assignmentId));

      if (!assignment) {
        res.status(HttpStatusCode.NOT_FOUND).json(ApiResponse(null, 'Assignment not found', false));
        return;
      }

      const assignmentDto = RolePermissionResponseDto.fromEntity(assignment);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(assignmentDto, 'Assignment retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a specific role-permission assignment
   */
  async removeAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;

      await this.rolePermissionService.removeAssignment(parseInt(assignmentId));

      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
