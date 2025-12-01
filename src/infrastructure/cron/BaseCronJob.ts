import { ILogger, logger } from '../logging';

export interface CronJobConfig {
  name: string;
  schedule: string; // Cron expression
  enabled: boolean;
  timezone?: string;
}

export abstract class BaseCronJob {
  protected readonly config: CronJobConfig;

  constructor(config: CronJobConfig) {
    this.config = config;
  }

  abstract execute(): Promise<void>;

  getName(): string {
    return this.config.name;
  }

  getSchedule(): string {
    return this.config.schedule;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getTimezone(): string {
    return this.config.timezone || 'UTC';
  }

  public async handleError(error: Error): Promise<void> {
    // You can add additional error handling logic here
    // For example, sending notifications, retrying, etc.
  }
}
