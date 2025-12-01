import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IUserRoleService } from '../interfaces/services/IUserRoleService';
import { IUserService } from '../interfaces/services/IUserService';
import { ApiResponse } from '../utils/apiResponse';
import { UserRoleAssignmentDto } from '../dtos/userRole';
import { HttpStatusCode } from '@/core/constants/http-status';

@injectable()
export class UserRoleController {
  private readonly userRoleService: IUserRoleService;
  private readonly userService: IUserService;

  constructor(
    @inject('UserRoleService') userRoleService: IUserRoleService,
    @inject('UserService') userService: IUserService,
  ) {
    this.userRoleService = userRoleService;
    this.userService = userService;
  }

  /**
   * Assign a role to a user
   */
  assignRole = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, roleId } = req.body as UserRoleAssignmentDto;
    const assignedByPid = req.user?.sub;

    const assignedById = assignedByPid
      ? await this.userService.findUserIdByPid(assignedByPid)
      : undefined;
    const result = await this.userRoleService.assignRole(
      userId,
      parseInt(roleId),
      assignedById ?? undefined,
    );

    return res.status(HttpStatusCode.OK).json(ApiResponse(result, 'Role assigned successfully'));
  };

  /**
   * Remove a role from a user
   */
  removeRole = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, roleId } = req.params;

    const success = await this.userRoleService.removeRole(userId, parseInt(roleId));

    if (!success) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json(ApiResponse(null, 'Role assignment not found'));
    }

    return res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Role removed successfully'));
  };

  /**
   * Get all roles assigned to a user
   */
  getUserRoles = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const userRoles = await this.userRoleService.getUserRoles(userId);

    return res
      .status(HttpStatusCode.OK)
      .json(ApiResponse(userRoles, 'User roles retrieved successfully'));
  };

  /**
   * Get all users assigned to a role
   */
  getRoleUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.userRoleService.getRoleUsers(parseInt(roleId), page, limit);

    return res
      .status(HttpStatusCode.OK)
      .json(ApiResponse(result, 'Role users retrieved successfully'));
  };

  /**
   * Check if a user has a specific role
   */
  checkUserRole = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, roleId } = req.params;

    const hasRole = await this.userRoleService.userHasRole(userId, parseInt(roleId));

    return res.status(HttpStatusCode.OK).json(ApiResponse({ hasRole }, 'Role check completed'));
  };

  /**
   * Get role statistics
   */
  getRoleStats = async (req: Request, res: Response, next: NextFunction) => {
    const { roleId } = req.params;

    const stats = await this.userRoleService.getRoleStats(parseInt(roleId));

    return res
      .status(HttpStatusCode.OK)
      .json(ApiResponse(stats, 'Role statistics retrieved successfully'));
  };
}
