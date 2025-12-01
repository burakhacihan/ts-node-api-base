import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../interfaces/services/IUserService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../core/constants/http-status';

@injectable()
export class UserController {
  private readonly userService: IUserService;

  constructor(@inject('UserService') userService: IUserService) {
    this.userService = userService;
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json(ApiResponse(null, 'Unauthorized', false));
        return;
      }

      const profile = await this.userService.getProfile(userId);

      if (!profile) {
        res.status(HttpStatusCode.NOT_FOUND).json(ApiResponse(null, 'Profile not found', false));
        return;
      }

      res.status(HttpStatusCode.OK).json(ApiResponse(profile, 'Profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = req.params.id;
      const userId = req.user?.sub;
      const userRoles = req.user?.roles || [];

      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json(ApiResponse(null, 'Unauthorized', false));
        return;
      }

      // Check if user is requesting their own data or is admin
      const isAdmin = userRoles.includes('ADMIN');
      const isOwnProfile = targetUserId === userId;

      if (!isOwnProfile && !isAdmin) {
        res.status(HttpStatusCode.FORBIDDEN).json(ApiResponse(null, 'Forbidden', false));
        return;
      }

      const user = await this.userService.getUserById(targetUserId);

      if (!user) {
        res.status(HttpStatusCode.NOT_FOUND).json(ApiResponse(null, 'User not found', false));
        return;
      }

      res.status(HttpStatusCode.OK).json(ApiResponse(user, 'User details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      const updateData = req.body;

      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json(ApiResponse(null, 'Unauthorized', false));
        return;
      }

      const updatedProfile = await this.userService.updateProfile(userId, updateData);

      if (!updatedProfile) {
        res.status(HttpStatusCode.NOT_FOUND).json(ApiResponse(null, 'User not found', false));
        return;
      }

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse(updatedProfile, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json(ApiResponse(null, 'Unauthorized', false));
        return;
      }

      const success = await this.userService.changePassword(userId, currentPassword, newPassword);

      if (!success) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(ApiResponse(null, 'Invalid current password', false));
        return;
      }

      res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deactivateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json(ApiResponse(null, 'Unauthorized', false));
        return;
      }

      const success = await this.userService.deactivateUser(userId);

      if (!success) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(ApiResponse(null, 'Account deactivation failed', false));
        return;
      }

      res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Account deactivated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();

      res.status(HttpStatusCode.OK).json(ApiResponse(users, 'Users retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, roleId } = req.body;

      const user = await this.userService.assignRoleById(userId, roleId);

      if (!user) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(ApiResponse(null, 'Failed to assign role', false));
        return;
      }

      res.status(HttpStatusCode.OK).json(ApiResponse(user, 'Role assigned successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await this.userService.getAllRoles();

      res.status(HttpStatusCode.OK).json(ApiResponse(roles, 'Roles retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
