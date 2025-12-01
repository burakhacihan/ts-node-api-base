import { IQueue, QueueOptions, QueueMessage, QueueStats, HealthStatus } from './interfaces/IQueue';

export abstract class BaseQueue<T = any> implements IQueue<T> {
  protected readonly options: QueueOptions;
  protected isSubscribed = false;
  protected isShuttingDown = false;
  protected isConnectedFlag = false;

  constructor(options: QueueOptions) {
    this.options = options;
  }

  abstract publish(message: T, options?: Partial<QueueOptions>): Promise<void>;
  abstract subscribe(handler: (message: QueueMessage<T>) => Promise<void>): Promise<void>;
  abstract unsubscribe(): Promise<void>;
  abstract close(): Promise<void>;
  abstract isConnected(): boolean;
  abstract getQueueStats(): Promise<QueueStats>;
  abstract healthCheck(): Promise<HealthStatus>;

  protected createQueueMessage(data: T, options?: Partial<QueueOptions>): QueueMessage<T> {
    return {
      id: this.generateMessageId(),
      data,
      metadata: {
        timestamp: Date.now(),
        retryCount: 0,
        priority: options?.priority || this.options.priority ? 1 : 0,
        queueName: this.options.name,
      },
    };
  }

  protected generateMessageId(): string {
    return `${this.options.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected async handleMessageWithRetry(
    message: QueueMessage<T>,
    handler: (message: QueueMessage<T>) => Promise<void>,
  ): Promise<void> {
    let retryCount = 0;
    const maxRetries = this.options.maxRetries || 3;

    while (retryCount <= maxRetries) {
      try {
        if (this.isShuttingDown) {
          return;
        }

        await handler(message);
        return;
      } catch (error) {
        retryCount++;

        if (retryCount > maxRetries) {
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, this.options.retryDelay || 5000));
      }
    }
  }

  setShutdownMode(): void {
    this.isShuttingDown = true;
  }

  isInShutdownMode(): boolean {
    return this.isShuttingDown;
  }

  protected calculateRetryDelay(attempt: number): number {
    const baseDelay = this.options.retryDelay || 5000;
    return baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
  }
}
