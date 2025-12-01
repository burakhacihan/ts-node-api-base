import { QueueOptions } from '../infrastructure/queue/interfaces/IQueue';

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  queues: {
    [key: string]: QueueOptions;
  };
  priorityQueues: {
    [key: string]: QueueOptions;
  };
}

export const defaultQueueConfig: QueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  queues: {
    default: {
      name: 'default',
      maxRetries: parseInt(process.env.QUEUE_DEFAULT_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.QUEUE_DEFAULT_RETRY_DELAY || '5000'),
      timeout: parseInt(process.env.QUEUE_DEFAULT_TIMEOUT || '30000'),
      priority: parseInt(process.env.QUEUE_DEFAULT_PRIORITY || '0'),
    },
    email: {
      name: 'email',
      maxRetries: parseInt(process.env.QUEUE_EMAIL_MAX_RETRIES || '5'),
      retryDelay: parseInt(process.env.QUEUE_EMAIL_RETRY_DELAY || '10000'),
      timeout: parseInt(process.env.QUEUE_EMAIL_TIMEOUT || '60000'),
      priority: parseInt(process.env.QUEUE_EMAIL_PRIORITY || '1'),
      concurrency: parseInt(process.env.QUEUE_EMAIL_CONCURRENCY || '5'),
    },
  },
  priorityQueues: {},
};
