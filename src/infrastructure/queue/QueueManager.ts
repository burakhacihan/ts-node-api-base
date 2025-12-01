import { injectable, inject } from 'tsyringe';
import { IQueue, QueueOptions, QueueMessage } from './interfaces/IQueue';
import { QueueFactory } from './QueueFactory';

@injectable()
export class QueueManager {
  private queues: Map<string, IQueue> = new Map();
  private isAcceptingJobs: boolean = true;
  private activeJobs = new Map<string, { queue: string; startTime: number }>();

  constructor(@inject('QueueFactory') private queueFactory: QueueFactory) {}

  registerQueue<T = any>(queue: IQueue<T>, options: QueueOptions): void {
    if (this.queues.has(options.name)) {
      return;
    }

    this.queues.set(options.name, queue);
  }

  createAndRegisterQueue<T = any>(
    provider: 'redis' | 'memory',
    options: QueueOptions,
    redisConfig?: any,
  ): IQueue<T> {
    const queue = this.queueFactory.createQueue<T>({
      provider,
      options,
      redisConfig,
    });

    this.registerQueue(queue, options);
    return queue;
  }

  getQueue<T = any>(name: string): IQueue<T> | undefined {
    return this.queues.get(name) as IQueue<T>;
  }

  async publish<T = any>(
    queueName: string,
    message: T,
    options?: Partial<QueueOptions>,
  ): Promise<void> {
    if (!this.isAcceptingJobs) {
      throw new Error('Queue manager is not accepting new jobs during shutdown');
    }

    const queue = this.getQueue<T>(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.publish(message, options);
  }

  async process<T = any>(
    queueName: string,
    handler: (message: QueueMessage<T>) => Promise<void>,
  ): Promise<void> {
    const queue = this.getQueue<T>(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.subscribe(async (message) => {
      const jobId = `${queueName}-${message.id}`;

      if (!this.isAcceptingJobs) {
        return;
      }

      this.activeJobs.set(jobId, {
        queue: queueName,
        startTime: Date.now(),
      });

      try {
        await handler(message);
      } catch (error) {
        throw error;
      } finally {
        this.activeJobs.delete(jobId);
      }
    });
  }

  async stopAcceptingJobs(): Promise<void> {
    this.isAcceptingJobs = false;
  }

  async closeAllQueues(): Promise<void> {
    for (const [name, queue] of this.queues) {
      try {
        await queue.close();
      } catch {}
    }

    this.queues.clear();
    this.activeJobs.clear();
  }

  async closeAll(): Promise<void> {
    await this.closeAllQueues();
  }

  getActiveJobsCount(): number {
    return this.activeJobs.size;
  }

  getActiveJobs(): Map<string, { queue: string; startTime: number }> {
    return new Map(this.activeJobs);
  }

  getIsAcceptingJobs(): boolean {
    return this.isAcceptingJobs;
  }

  getQueueStats(): { totalQueues: number; activeJobs: number; acceptingJobs: boolean } {
    return {
      totalQueues: this.queues.size,
      activeJobs: this.activeJobs.size,
      acceptingJobs: this.isAcceptingJobs,
    };
  }
}
