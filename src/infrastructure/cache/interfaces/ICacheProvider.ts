import { CacheOptions } from './CacheOptions';
import { CacheStats } from './CacheStats';

export interface ICacheProvider {
  // Core operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;

  // Pattern operations
  delPattern(pattern: string): Promise<void>;
  flushNamespace(namespace: string): Promise<void>;

  // Stats and health
  getStats(): Promise<CacheStats>;
  isHealthy(): Promise<boolean>;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
