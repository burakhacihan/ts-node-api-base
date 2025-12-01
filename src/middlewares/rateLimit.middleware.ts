import rateLimit from 'express-rate-limit';
import {
  RateLimitConfig,
  defaultRateLimitConfig,
  authRateLimitConfig,
  apiRateLimitConfig,
  customKeyGenerator,
  customRateLimitHandler,
} from '../config/rateLimit';

export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = {
    ...defaultRateLimitConfig,
    ...config,
  };

  if (!finalConfig.enabled) {
    return (req: any, res: any, next: any) => next();
  }

  return rateLimit({
    windowMs: finalConfig.windowMs,
    max: finalConfig.max,
    standardHeaders: finalConfig.standardHeaders,
    legacyHeaders: finalConfig.legacyHeaders,
    skipFailedRequests: finalConfig.skipFailedRequests,
    skipSuccessfulRequests: finalConfig.skipSuccessfulRequests,
    keyGenerator: (req) => {
      return (req.headers['x-forwarded-for'] as string) || (req.ip as string);
    },
    handler: finalConfig.handler || customRateLimitHandler,
  });
};

// Create different rate limiters for different purposes
export const globalRateLimiter = createRateLimiter();

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = createRateLimiter(authRateLimitConfig);

// Rate limiter for API endpoints
export const apiRateLimiter = createRateLimiter(apiRateLimitConfig);
