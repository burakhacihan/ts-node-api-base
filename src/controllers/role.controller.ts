import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IRoleService } from '../interfaces/services/IRoleService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../core/constants/http-status';
import { RoleResponseDto } from '../dtos/role';

@injectable()
export class RoleController {
  private readonly roleService: IRoleService;

  constructor(@inject('RoleService') roleService: IRoleService) {
    this.roleService = roleService;
  }

  /**
   * Get all roles with pagination and filtering
   */
  async getAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const result = await this.roleService.getAllRoles(
        Number(page),
        Number(limit),
        search as string,
      );

      const roles = RoleResponseDto.fromEntities(result.roles);

      res.status(HttpStatusCode.OK).json(
        ApiResponse(
          {
            roles,
            pagination: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          },
          'Roles retrieved successfully',
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific role by ID
   */
  async getRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const role = await this.roleService.findById(parseInt(id));

      if (!role) {
        res.status(HttpStatusCode.NOT_FOUND).json(ApiResponse(null, 'Role not found', false));
        return;
      }

      const roleDto = RoleResponseDto.fromEntity(role);

      res.status(HttpStatusCode.OK).json(ApiResponse(roleDto, 'Role retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new role
   */
  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = req.body;

      const role = await this.roleService.createRole(name, description);
      const roleDto = RoleResponseDto.fromEntity(role);

      res.status(HttpStatusCode.CREATED).json(ApiResponse(roleDto, 'Role created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const role = await this.roleService.updateRole(parseInt(id), name, description);
      const roleDto = RoleResponseDto.fromEntity(role);

      res.status(HttpStatusCode.OK).json(ApiResponse(roleDto, 'Role updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.roleService.deleteRole(parseInt(id));

      res.status(HttpStatusCode.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
