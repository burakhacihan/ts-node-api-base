import { ICacheProvider } from './interfaces/ICacheProvider';
import { CacheOptions } from './interfaces/CacheOptions';
import { RedisCacheProvider } from './providers/redis.provider';
import { MemoryCacheProvider } from './providers/memory.provider';

export class CacheManager {
  private static instance: CacheManager;
  private provider: ICacheProvider;
  private constructor() {
    this.initializeProvider();
  }

  private initializeProvider(): void {
    const driver = process.env.CACHE_DRIVER || 'memory';
    const prefix = process.env.CACHE_PREFIX || 'app:';

    if (driver === 'redis' || (process.env.NODE_ENV === 'production' && driver !== 'memory')) {
      this.provider = new RedisCacheProvider({
        prefix,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      });
    } else {
      this.provider = new MemoryCacheProvider({ prefix });
    }
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    return this.provider.get<T>(key);
  }

  public async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    await this.provider.set<T>(key, value, options);
  }

  public async del(key: string): Promise<void> {
    await this.provider.del(key);
  }

  public async has(key: string): Promise<boolean> {
    return this.provider.has(key);
  }

  public async clear(): Promise<void> {
    await this.provider.clear();
  }

  public async delPattern(pattern: string): Promise<void> {
    await this.provider.delPattern(pattern);
  }

  public async flushNamespace(namespace: string): Promise<void> {
    await this.provider.flushNamespace(namespace);
  }

  public async getStats(): Promise<any> {
    return this.provider.getStats();
  }

  public async isHealthy(): Promise<boolean> {
    return this.provider.isHealthy();
  }
}
