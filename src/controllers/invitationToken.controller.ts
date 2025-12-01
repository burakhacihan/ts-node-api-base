import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IInvitationTokenService } from '../interfaces/services/IInvitationTokenService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '@/core/constants/http-status';

@injectable()
export class InvitationTokenController {
  private readonly invitationTokenService: IInvitationTokenService;

  constructor(@inject('InvitationTokenService') invitationTokenService: IInvitationTokenService) {
    this.invitationTokenService = invitationTokenService;
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { expiresInHours = 24 } = req.body;
      const userId = req.user?.sub || '';
      const roles = req.user?.roles || [];

      const result = await this.invitationTokenService.createTokenForUser(
        userId,
        roles,
        expiresInHours,
      );

      res.status(HttpStatusCode.CREATED).json(ApiResponse(result, 'Invitation token created'));
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = req.user?.roles || [];

      const tokens = await this.invitationTokenService.listTokensForAdmin(roles);

      res.json(ApiResponse(tokens, 'Invitation tokens fetched'));
    } catch (error) {
      next(error);
    }
  }
}
