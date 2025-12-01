import { BaseCronJob } from '../BaseCronJob';
import { container, inject, injectable } from 'tsyringe';
import { IInvitationTokenService } from '@/interfaces/services/IInvitationTokenService';

@injectable()
export class CleanupExpiredInvitationTokensJob extends BaseCronJob {
  private tokenService = container.resolve<IInvitationTokenService>('InvitationTokenService');

  constructor() {
    super({
      name: 'CleanupExpiredInvitationTokens',
      schedule: '0 0 * * *', // Run daily at midnight
      enabled: true,
    });
  }

  async execute(): Promise<void> {
    await this.tokenService.cleanupExpiredTokens();
  }
}
