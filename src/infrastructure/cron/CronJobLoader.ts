import { CronJobManager } from './CronJobManager';
import { CleanupExpiredInvitationTokensJob } from './jobs/CleanupExpiredInvitationTokens';

export class CronJobLoader {
  private static instance: CronJobLoader;
  private readonly manager: CronJobManager;

  private constructor() {
    this.manager = CronJobManager.getInstance();
  }

  static getInstance(): CronJobLoader {
    if (!CronJobLoader.instance) {
      CronJobLoader.instance = new CronJobLoader();
    }
    return CronJobLoader.instance;
  }

  async loadJobs(): Promise<void> {
    try {
      // Register all cron jobs here
      await this.manager.registerJob(new CleanupExpiredInvitationTokensJob());
      // Add more jobs as needed

      // Start all registered jobs
      await this.manager.startAll();
    } catch (error) {
      throw error;
    }
  }
}
