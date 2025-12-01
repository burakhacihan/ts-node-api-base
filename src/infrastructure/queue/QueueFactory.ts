import { injectable } from 'tsyringe';
import { IQueue } from './interfaces/IQueue';
import { QueueOptions } from './interfaces/IQueue';
import { RedisQueue } from './implementations/RedisQueue';
import { MemoryQueue } from './implementations/MemoryQueue';

export type QueueProvider = 'redis' | 'memory';

interface QueueFactoryConfig {
  provider: QueueProvider;
  options: QueueOptions;
  redisConfig?: any;
}

@injectable()
export class QueueFactory {
  constructor() {}

  createQueue<T = any>(config: QueueFactoryConfig): IQueue<T> {
    switch (config.provider) {
      case 'redis':
        return new RedisQueue<T>({
          options: config.options,
          redisConfig: config.redisConfig || {},
        });
      case 'memory':
        return new MemoryQueue<T>({
          options: config.options,
        });
      default:
        throw new Error(`Unsupported queue provider: ${config.provider}`);
    }
  }

  getSupportedProviders(): QueueProvider[] {
    return ['redis', 'memory'];
  }
}
