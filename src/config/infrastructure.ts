import { logger } from '../infrastructure/logging';
import { CronJobLoader } from '../infrastructure/cron/CronJobLoader';
import { QueueInitializer } from '../infrastructure/queue/QueueInitializer';

export async function initializeInfrastructure(): Promise<void> {
  logger.info('Initializing infrastructure...');

  // Initialize cron jobs
  await CronJobLoader.getInstance().loadJobs();
  logger.info('Cron jobs initialized');

  // Initialize queue system
  await QueueInitializer.getInstance().initialize();
  logger.info('Queue system initialized');
}
