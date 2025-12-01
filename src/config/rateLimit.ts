export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipFailedRequests: boolean;
  skipSuccessfulRequests: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
}

export const defaultRateLimitConfig: RateLimitConfig = {
  enabled: process.env.RATE_LIMIT_ENABLED === 'true',
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
};

// Custom key generator that uses user ID if available, otherwise falls back to IP
export const customKeyGenerator = (req: any) => {
  if (req.user?.sub) {
    return `user_${req.user.sub}`;
  }
  return req.ip;
};

// Custom handler for rate limit exceeded
export const customRateLimitHandler = (req: any, res: any) => {
  res.status(429).json({
    success: false,
    message: defaultRateLimitConfig.message,
    retryAfter: res.getHeader('Retry-After'),
  });
};

// Auth-specific rate limit configuration
export const authRateLimitConfig: Partial<RateLimitConfig> = {
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'), // 5 attempts
  message: 'Too many login attempts, please try again later.',
};

// API-specific rate limit configuration
export const apiRateLimitConfig: Partial<RateLimitConfig> = {
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.API_RATE_LIMIT_MAX || '60'), // 60 requests per minute
};
