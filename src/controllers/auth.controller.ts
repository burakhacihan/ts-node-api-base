import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../interfaces/services/IAuthService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../core/constants/http-status';

@injectable()
export class AuthController {
  private readonly authService: IAuthService;

  constructor(@inject('AuthService') authService: IAuthService) {
    this.authService = authService;
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const loginResponse = await this.authService.login(email, password);

      res.status(HttpStatusCode.OK).json(ApiResponse(loginResponse, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;

      const refreshResponse = await this.authService.refreshAccessToken(refreshToken);

      if (refreshResponse) {
        res
          .status(HttpStatusCode.OK)
          .json(ApiResponse(refreshResponse, 'Token refreshed successfully'));
      } else {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json(ApiResponse(null, 'Invalid refresh token', false));
      }
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerResponse = await this.authService.registerUser(req.body);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse(registerResponse, 'Registration successful'));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.headers.authorization?.replace('Bearer ', '');
      const refreshToken = req.body.refreshToken;
      const userId = req.user?.sub;

      if (!accessToken) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(ApiResponse(null, 'Access token required', false));
        return;
      }

      await this.authService.logout(accessToken, refreshToken, userId);

      res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      await this.authService.forgotPassword(email);
      res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Password reset email sent'));
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      const result = await this.authService.resetPassword(token, newPassword);

      if (result) {
        res.status(HttpStatusCode.OK).json(ApiResponse(null, 'Password reset successful'));
      } else {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .json(ApiResponse(null, 'Invalid or expired token', false));
      }
    } catch (error) {
      next(error);
    }
  }
}
