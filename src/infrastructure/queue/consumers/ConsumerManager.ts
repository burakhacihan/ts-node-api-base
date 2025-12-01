import { injectable, inject } from 'tsyringe';
import { IConsumer, ConsumerStats } from './interfaces/IConsumer';
import { EmailConsumer } from './EmailConsumer';
import { DefaultConsumer } from './DefaultConsumer';

@injectable()
export class ConsumerManager {
  private consumers: Map<string, IConsumer> = new Map();
  private isRunning = false;

  constructor(
    @inject('EmailConsumer') private emailConsumer: EmailConsumer,
    @inject('DefaultConsumer') private defaultConsumer: DefaultConsumer,
  ) {
    this.registerConsumer(this.emailConsumer);
    this.registerConsumer(this.defaultConsumer);
  }

  private registerConsumer(consumer: IConsumer): void {
    this.consumers.set(consumer.queueName, consumer);
  }

  async startAll(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    const enableConsumers = process.env.ENABLE_QUEUE_CONSUMERS !== 'false';

    if (!enableConsumers) {
      return;
    }

    const startPromises = Array.from(this.consumers.values()).map(async (consumer) => {
      try {
        await consumer.start();
      } catch (error) {
        throw error;
      }
    });

    await Promise.all(startPromises);
    this.isRunning = true;
  }

  async stopAll(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    const stopPromises = Array.from(this.consumers.values()).map(async (consumer) => {
      try {
        await consumer.stop();
      } catch {}
    });

    await Promise.all(stopPromises);
    this.isRunning = false;
  }

  async startConsumer(queueName: string): Promise<void> {
    const consumer = this.consumers.get(queueName);
    if (!consumer) {
      throw new Error(`Consumer for queue ${queueName} not found`);
    }

    await consumer.start();
  }

  async stopConsumer(queueName: string): Promise<void> {
    const consumer = this.consumers.get(queueName);
    if (!consumer) {
      throw new Error(`Consumer for queue ${queueName} not found`);
    }

    await consumer.stop();
  }

  getConsumer(queueName: string): IConsumer | undefined {
    return this.consumers.get(queueName);
  }

  getAllConsumers(): IConsumer[] {
    return Array.from(this.consumers.values());
  }

  async getStats(): Promise<ConsumerStats[]> {
    const stats: ConsumerStats[] = [];

    for (const consumer of this.consumers.values()) {
      if ('getStats' in consumer && typeof consumer.getStats === 'function') {
        stats.push((consumer as any).getStats());
      } else {
        const healthCheck = await consumer.healthCheck();
        stats.push({
          queueName: consumer.queueName,
          isRunning: consumer.isRunning,
          messagesProcessed: 0,
          lastProcessedAt: healthCheck.lastProcessed,
          errorCount: 0,
          averageProcessingTime: 0,
        });
      }
    }

    return stats;
  }

  async healthCheck(): Promise<{
    isHealthy: boolean;
    consumers: { [queueName: string]: { isHealthy: boolean; lastProcessed?: Date } };
  }> {
    const consumerHealth: { [queueName: string]: { isHealthy: boolean; lastProcessed?: Date } } =
      {};
    let overallHealthy = true;

    for (const [queueName, consumer] of this.consumers) {
      const health = await consumer.healthCheck();
      consumerHealth[queueName] = health;
      if (!health.isHealthy) {
        overallHealthy = false;
      }
    }

    return {
      isHealthy: overallHealthy,
      consumers: consumerHealth,
    };
  }

  getRunningStatus(): {
    isRunning: boolean;
    totalConsumers: number;
    runningConsumers: number;
    enabledByEnvironment: boolean;
  } {
    const runningConsumers = Array.from(this.consumers.values()).filter((c) => c.isRunning).length;

    return {
      isRunning: this.isRunning,
      totalConsumers: this.consumers.size,
      runningConsumers,
      enabledByEnvironment: process.env.ENABLE_QUEUE_CONSUMERS !== 'false',
    };
  }
}
