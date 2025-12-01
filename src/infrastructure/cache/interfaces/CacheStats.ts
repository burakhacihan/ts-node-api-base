export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  lastError?: Error;
}
