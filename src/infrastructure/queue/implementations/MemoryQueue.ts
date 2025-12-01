import { injectable } from 'tsyringe';
import { BaseQueue } from '../BaseQueue';
import { QueueMessage, QueueOptions, QueueStats, HealthStatus } from '../interfaces/IQueue';

interface MemoryQueueConfig {
  options: QueueOptions;
}

@injectable()
export class MemoryQueue<T = any> extends BaseQueue<T> {
  private queues = new Map<string, QueueMessage[]>();
  private handlers = new Map<string, (message: QueueMessage<any>) => Promise<void>>();
  private processingLoops = new Map<string, Promise<void>>();

  constructor(config: MemoryQueueConfig) {
    super(config.options);
  }

  async publish(message: T, options?: Partial<QueueOptions>): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('Queue is shutting down');
    }

    const queueMessage = this.createQueueMessage(message, options);

    if (!this.queues.has(this.options.name)) {
      this.queues.set(this.options.name, []);
    }

    this.queues.get(this.options.name)!.push(queueMessage);
  }

  async subscribe(handler: (message: QueueMessage<T>) => Promise<void>): Promise<void> {
    if (this.isSubscribed) {
      return;
    }

    this.isSubscribed = true;
    this.handlers.set(this.options.name, handler);

    const processingLoop = this.startProcessingLoop(handler);
    this.processingLoops.set(this.options.name, processingLoop);
  }

  private async startProcessingLoop(
    handler: (message: QueueMessage<T>) => Promise<void>,
  ): Promise<void> {
    while (this.isSubscribed && !this.isShuttingDown) {
      try {
        const queue = this.queues.get(this.options.name);
        if (queue && queue.length > 0) {
          const message = queue.shift()!;
          await this.handleMessageWithRetry(message, handler);
        } else {
          // Wait a bit before checking again
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, this.options.retryDelay || 5000));
      }
    }
  }

  async unsubscribe(): Promise<void> {
    this.isSubscribed = false;
    this.handlers.delete(this.options.name);
  }

  async close(): Promise<void> {
    this.setShutdownMode();
    await this.unsubscribe();
    this.queues.clear();
  }

  isConnected(): boolean {
    return !this.isShuttingDown;
  }

  async getQueueStats(): Promise<QueueStats> {
    return {
      queueName: this.options.name,
      messageCount: this.queues.get(this.options.name)?.length || 0,
      consumerCount: this.handlers.has(this.options.name) ? 1 : 0,
      isConnected: this.isConnected(),
      lastProcessedAt: new Date(),
    };
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      isHealthy: this.isConnected(),
      provider: 'memory',
      connectionStatus: this.isConnected() ? 'connected' : 'disconnected',
      lastCheck: new Date(),
    };
  }
}
