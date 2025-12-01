import { ICacheProvider } from '../interfaces/ICacheProvider';
import { CacheOptions } from '../interfaces/CacheOptions';
import { CacheStats } from '../interfaces/CacheStats';
import { formatKey, validateKey } from '../cache.utils';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

export class MemoryCacheProvider implements ICacheProvider {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
  };
  private prefix: string;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: { prefix?: string; cleanupInterval?: number } = {}) {
    this.prefix = options.prefix || 'cache:';

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), options.cleanupInterval || 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
        this.stats.keys--;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix);

    const entry = this.cache.get(formattedKey);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(formattedKey);
      this.stats.misses++;
      this.stats.keys--;
      return null;
    }

    this.stats.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix, options?.namespace);

    const entry: CacheEntry<T> = {
      value,
      expiresAt: options?.ttl ? Date.now() + options.ttl * 1000 : undefined,
    };

    this.cache.set(formattedKey, entry);
    this.stats.keys++;
  }

  async del(key: string): Promise<void> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix);

    if (this.cache.delete(formattedKey)) {
      this.stats.keys--;
    }
  }

  async has(key: string): Promise<boolean> {
    validateKey(key);
    const formattedKey = formatKey(key, this.prefix);

    const entry = this.cache.get(formattedKey);
    if (!entry) return false;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(formattedKey);
      this.stats.keys--;
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.keys = 0;
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(`^${formatKey(pattern, this.prefix).replace(/\*/g, '.*')}$`);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.stats.keys--;
      }
    }
  }

  async flushNamespace(namespace: string): Promise<void> {
    await this.delPattern(`${namespace}:*`);
  }

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async connect(): Promise<void> {
    // No-op for memory cache
  }

  async disconnect(): Promise<void> {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}
