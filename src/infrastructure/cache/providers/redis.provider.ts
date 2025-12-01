import Redis from 'ioredis';
import { ICacheProvider } from '../interfaces/ICacheProvider';
import { CacheOptions } from '../interfaces/CacheOptions';
import { CacheStats } from '../interfaces/CacheStats';
import { formatKey, validateKey } from '../cache.utils';

export class RedisCacheProvider implements ICacheProvider {
  private client: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
  };
  private prefix: string;

  constructor(
    options: {
      host?: string;
      port?: number;
      password?: string;
      prefix?: string;
      retryStrategy?: (times: number) => number;
    } = {},
  ) {
    this.prefix = options.prefix || 'cache:';

    this.client = new Redis({
      host: options.host || process.env.REDIS_HOST || 'localhost',
      port: parseInt(options.port?.toString() || process.env.REDIS_PORT || '6379'),
      password: options.password || process.env.REDIS_PASSWORD,
      retryStrategy: options.retryStrategy || this.defaultRetryStrategy,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('error', (error) => {
      this.stats.lastError = error;
    });

    this.client.on('connect', () => {});

    this.client.on('reconnecting', () => {});
  }

  private defaultRetryStrategy(times: number): number {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }

  async get<T>(key: string): Promise<T | null> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix);

    try {
      const data = await this.client.get(formattedKey);
      if (data) {
        this.stats.hits++;
        return JSON.parse(data) as T;
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix, options?.namespace);

    try {
      const serialized = JSON.stringify(value);
      if (options?.ttl) {
        await this.client.setex(formattedKey, options.ttl, serialized);
      } else {
        await this.client.set(formattedKey, serialized);
      }
      this.stats.keys++;
    } catch {}
  }

  async del(key: string): Promise<void> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix);

    try {
      await this.client.del(formattedKey);
      this.stats.keys--;
    } catch {}
  }

  async has(key: string): Promise<boolean> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix);

    try {
      return (await this.client.exists(formattedKey)) === 1;
    } catch {
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
      this.stats.keys = 0;
    } catch {}
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(formatKey(pattern, this.prefix));
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.stats.keys -= keys.length;
      }
    } catch {}
  }

  async flushNamespace(namespace: string): Promise<void> {
    await this.delPattern(`${namespace}:*`);
  }

  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.client.info();
      const keys = parseInt(info.match(/db0:keys=(\d+)/)?.[1] || '0');
      return {
        ...this.stats,
        keys,
      };
    } catch {
      return this.stats;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async connect(): Promise<void> {
    if (this.client.status !== 'ready') {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
