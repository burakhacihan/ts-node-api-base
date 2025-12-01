import { injectable } from 'tsyringe';
import Redis, { RedisOptions } from 'ioredis';
import { BaseQueue } from '../BaseQueue';
import { QueueMessage, QueueOptions, QueueStats, HealthStatus } from '../interfaces/IQueue';

interface RedisQueueConfig {
  options: QueueOptions;
  redisConfig: RedisOptions;
}

@injectable()
export class RedisQueue<T = any> extends BaseQueue<T> {
  private readonly redis: Redis;
  private readonly channel: string;
  private processingLoop: Promise<void> | null = null;

  constructor(config: RedisQueueConfig) {
    super(config.options);
    this.redis = new Redis(config.redisConfig);
    this.channel = `queue:${config.options.name}`;
  }

  async publish(message: T, options?: Partial<QueueOptions>): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('Queue is shutting down');
    }

    const queueMessage = this.createQueueMessage(message, options);
    await this.redis.lpush(this.channel, JSON.stringify(queueMessage));
  }

  async subscribe(handler: (message: QueueMessage<T>) => Promise<void>): Promise<void> {
    if (this.isSubscribed) {
      return;
    }

    this.isSubscribed = true;
    this.processingLoop = this.startProcessingLoop(handler);
  }

  private async startProcessingLoop(
    handler: (message: QueueMessage<T>) => Promise<void>,
  ): Promise<void> {
    while (this.isSubscribed && !this.isShuttingDown) {
      try {
        const message = await this.redis.brpop(this.channel, 1); // 1 second timeout
        if (message && !this.isShuttingDown) {
          const queueMessage: QueueMessage<T> = JSON.parse(message[1]);
          await this.handleMessageWithRetry(queueMessage, handler);
        }
      } catch (error) {
        if (!this.isShuttingDown) {
          await new Promise((resolve) => setTimeout(resolve, this.options.retryDelay || 5000));
        }
      }
    }
  }

  async unsubscribe(): Promise<void> {
    this.isSubscribed = false;
  }

  async close(): Promise<void> {
    // Set shutdown mode
    this.setShutdownMode();

    // Stop accepting new messages
    await this.unsubscribe();

    // Wait for processing loop to complete
    if (this.processingLoop) {
      try {
        await Promise.race([
          this.processingLoop,
          new Promise((resolve) => setTimeout(resolve, 5000)), // 5 second timeout
        ]);
      } catch {}
    }

    // Close Redis connection
    await this.redis.quit();
  }

  isConnected(): boolean {
    return this.redis.status === 'ready';
  }

  async getQueueStats(): Promise<QueueStats> {
    const messageCount = await this.redis.llen(this.channel);

    return {
      queueName: this.options.name,
      messageCount,
      consumerCount: this.isSubscribed ? 1 : 0,
      isConnected: this.isConnected(),
      lastProcessedAt: new Date(),
    };
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      await this.redis.ping();
      return {
        isHealthy: true,
        provider: 'redis',
        connectionStatus: 'connected',
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        isHealthy: false,
        provider: 'redis',
        connectionStatus: 'disconnected',
        lastCheck: new Date(),
        errors: [error as string],
      };
    }
  }
}
