export interface QueueMessage<T = any> {
  id: string;
  data: T;
  metadata?: {
    timestamp: number;
    retryCount?: number;
    priority?: number;
    queueName?: string;
    [key: string]: any;
  };
}

export interface QueueOptions {
  name: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  priority?: number;
  concurrency?: number;
  prefetchCount?: number;
}

export interface IQueue<T = any> {
  publish(message: T, options?: Partial<QueueOptions>): Promise<void>;
  subscribe(handler: (message: QueueMessage<T>) => Promise<void>): Promise<void>;
  unsubscribe(): Promise<void>;
  close(): Promise<void>;

  // Additional methods for enhanced functionality
  isConnected(): boolean;
  getQueueStats(): Promise<QueueStats>;
  healthCheck(): Promise<HealthStatus>;
}

export interface QueueStats {
  queueName: string;
  messageCount: number;
  consumerCount: number;
  isConnected: boolean;
  lastProcessedAt?: Date;
}

export interface HealthStatus {
  isHealthy: boolean;
  provider: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastCheck: Date;
  errors?: string[];
}
