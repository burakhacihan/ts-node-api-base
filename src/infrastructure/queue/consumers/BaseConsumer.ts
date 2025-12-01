import { QueueMessage } from '../interfaces/IQueue';
import { QueueManager } from '../QueueManager';
import { IConsumer, ConsumerStats } from './interfaces/IConsumer';

export abstract class BaseConsumer<T = any> implements IConsumer<T> {
  protected _isRunning = false;
  protected _messagesProcessed = 0;
  protected _errorCount = 0;
  protected _lastProcessedAt?: Date;
  protected _totalProcessingTime = 0;

  constructor(
    public readonly queueName: string,
    protected readonly queueManager: QueueManager,
  ) {}

  get isRunning(): boolean {
    return this._isRunning;
  }

  async start(): Promise<void> {
    if (this._isRunning) {
      return;
    }

    try {
      await this.queueManager.process<T>(this.queueName, async (message: QueueMessage<T>) => {
        const startTime = Date.now();

        try {
          await this.handleMessage(message);

          this._messagesProcessed++;
          this._lastProcessedAt = new Date();
          this._totalProcessingTime += Date.now() - startTime;
        } catch (error) {
          this._errorCount++;
          throw error;
        }
      });

      this._isRunning = true;
    } catch (error) {
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;
  }

  abstract handleMessage(message: QueueMessage<T>): Promise<void>;

  async healthCheck(): Promise<{ isHealthy: boolean; lastProcessed?: Date }> {
    return {
      isHealthy: this._isRunning,
      lastProcessed: this._lastProcessedAt,
    };
  }

  getStats(): ConsumerStats {
    return {
      queueName: this.queueName,
      isRunning: this._isRunning,
      messagesProcessed: this._messagesProcessed,
      lastProcessedAt: this._lastProcessedAt,
      errorCount: this._errorCount,
      averageProcessingTime:
        this._messagesProcessed > 0 ? this._totalProcessingTime / this._messagesProcessed : 0,
    };
  }
}
