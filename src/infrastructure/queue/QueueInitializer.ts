import { QueueManager } from './QueueManager';
import { QueueConfig, defaultQueueConfig } from '../../config/queue';
import { QueueMessage } from './interfaces/IQueue';
import { ConsumerManager } from './consumers/ConsumerManager';
import { container } from 'tsyringe';

export class QueueInitializer {
  private static instance: QueueInitializer;
  private readonly queueManager: QueueManager;
  private consumerManager?: ConsumerManager;
  private isShuttingDown = false;
  private activeJobs = new Set<string>();

  private constructor() {
    this.queueManager = container.resolve<QueueManager>('QueueManager');
  }

  static getInstance(): QueueInitializer {
    if (!QueueInitializer.instance) {
      QueueInitializer.instance = new QueueInitializer();
    }
    return QueueInitializer.instance;
  }

  async initialize(config: QueueConfig = defaultQueueConfig): Promise<void> {
    try {
      // Create and register default queue (Redis)
      const defaultQueue = this.queueManager.createAndRegisterQueue(
        'redis',
        {
          name: 'default',
          maxRetries: 3,
          retryDelay: 5000,
          timeout: 30000,
          priority: 0, // Changed from false to 0
        },
        {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db,
        },
      );

      // Create and register email queue if configured
      if (config.queues.email) {
        const emailQueue = this.queueManager.createAndRegisterQueue(
          'redis',
          {
            name: 'email',
            maxRetries: 5,
            retryDelay: 10000,
            timeout: 60000,
            priority: 1, // Changed from true to 1
          },
          {
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            db: config.redis.db,
          },
        );
      }

      // Create and register notification queues if configured
      if (config.queues.notifications) {
        this.queueManager.createAndRegisterQueue('redis', config.queues.notifications, {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db,
        });
      }

      // Set up graceful shutdown handler
      this.setupGracefulShutdown();

      // Initialize and start consumers
      await this.initializeConsumers();
    } catch (error) {
      throw error;
    }
  }

  private async initializeConsumers(): Promise<void> {
    const enableConsumers = process.env.ENABLE_QUEUE_CONSUMERS !== 'false';

    if (!enableConsumers) {
      return;
    }

    try {
      // Get consumer manager from DI container
      this.consumerManager = container.resolve<ConsumerManager>('ConsumerManager');

      // Start all consumers
      await this.consumerManager.startAll();
    } catch (error) {
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    // Override queue manager process method to track active jobs
    const originalProcess = this.queueManager.process.bind(this.queueManager);

    this.queueManager.process = async (
      queueName: string,
      handler: (message: QueueMessage<any>) => Promise<void>,
    ) => {
      if (this.isShuttingDown) {
        throw new Error('Queue is shutting down');
      }

      // Track active jobs at the initializer level
      const jobId = `${queueName}-${Date.now()}`;
      this.activeJobs.add(jobId);

      try {
        await originalProcess(queueName, handler);
      } finally {
        this.activeJobs.delete(jobId);
      }
    };
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    // Stop consumers first
    if (this.consumerManager) {
      try {
        await this.consumerManager.stopAll();
      } catch {}
    }

    // Stop accepting new jobs
    await this.queueManager.stopAcceptingJobs();

    // Wait for active jobs to complete
    const maxWaitTime = 25000; // 25 seconds
    const startTime = Date.now();

    while (
      (this.activeJobs.size > 0 || this.queueManager.getActiveJobsCount() > 0) &&
      Date.now() - startTime < maxWaitTime
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (this.activeJobs.size > 0 || this.queueManager.getActiveJobsCount() > 0) {
      // Log warning about active jobs not completed
    }

    // Close all queue connections
    await this.queueManager.closeAllQueues();
  }

  getActiveJobsCount(): number {
    return this.activeJobs.size + this.queueManager.getActiveJobsCount();
  }

  isShutdownInProgress(): boolean {
    return this.isShuttingDown;
  }

  getQueueStats(): { initializerJobs: number; managerJobs: number; totalJobs: number } {
    return {
      initializerJobs: this.activeJobs.size,
      managerJobs: this.queueManager.getActiveJobsCount(),
      totalJobs: this.activeJobs.size + this.queueManager.getActiveJobsCount(),
    };
  }

  // Method to get queue manager for direct access
  getQueueManager(): QueueManager {
    return this.queueManager;
  }

  // Method to get consumer manager for direct access
  getConsumerManager(): ConsumerManager | undefined {
    return this.consumerManager;
  }

  // Method to create and register additional queues
  async createQueue(provider: 'redis' | 'memory', options: any, redisConfig?: any): Promise<void> {
    this.queueManager.createAndRegisterQueue(provider, options, redisConfig);
  }
}
