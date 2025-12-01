import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IEmailService } from '../infrastructure/email/interfaces/IEmailService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../core/constants/http-status';
import { EmailData } from '../infrastructure/email/types';

@injectable()
export class EmailController {
  private readonly emailService: IEmailService;

  constructor(@inject('EmailService') emailService: IEmailService) {
    this.emailService = emailService;
  }

  async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const emailData: EmailData = req.body;

      // Validate user permissions
      const userRoles: string[] = req.user?.roles || [];
      if (!userRoles.includes('ADMIN') && !userRoles.includes('EMAIL_SENDER')) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json(ApiResponse(null, 'You do not have permission to send emails', false));
        return;
      }

      const result = await this.emailService.sendEmail(emailData);

      if (result.success) {
        res.status(HttpStatusCode.OK).json(ApiResponse(result, 'Email sent successfully'));
      } else {
        res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json(ApiResponse(null, 'Failed to send email', false));
      }
    } catch (error) {
      next(error);
    }
  }

  async sendEmailWithRetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { emailData, retryConfig } = req.body;

      // Validate user permissions
      const userRoles: string[] = req.user?.roles || [];
      if (!userRoles.includes('ADMIN') && !userRoles.includes('EMAIL_SENDER')) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json(ApiResponse(null, 'You do not have permission to send emails', false));
        return;
      }

      const result = await this.emailService.sendEmailWithRetry(emailData, retryConfig);

      if (result.success) {
        res.status(HttpStatusCode.OK).json(ApiResponse(result, 'Email sent successfully'));
      } else {
        res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json(ApiResponse(null, 'Failed to send email', false));
      }
    } catch (error) {
      next(error);
    }
  }

  async queueEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { emailData, delay } = req.body;

      // Validate user permissions
      const userRoles: string[] = req.user?.roles || [];
      if (!userRoles.includes('ADMIN') && !userRoles.includes('EMAIL_SENDER')) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .json(ApiResponse(null, 'You do not have permission to queue emails', false));
        return;
      }

      const result = await this.emailService.queueEmail(emailData, delay);

      res.status(HttpStatusCode.ACCEPTED).json(ApiResponse(result, 'Email queued successfully'));
    } catch (error) {
      next(error);
    }
  }
}
