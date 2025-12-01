import { QueueMessage } from '../../interfaces/IQueue';

export interface IConsumer<T = any> {
  readonly queueName: string;
  readonly isRunning: boolean;

  start(): Promise<void>;
  stop(): Promise<void>;
  handleMessage(message: QueueMessage<T>): Promise<void>;
  healthCheck(): Promise<{ isHealthy: boolean; lastProcessed?: Date }>;
}

export interface ConsumerConfig {
  enabled: boolean;
  concurrency?: number;
  retries?: number;
  timeout?: number;
}

export interface ConsumerStats {
  queueName: string;
  isRunning: boolean;
  messagesProcessed: number;
  lastProcessedAt?: Date;
  errorCount: number;
  averageProcessingTime: number;
}
