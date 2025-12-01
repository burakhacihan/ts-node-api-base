import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../infrastructure/logging';

// Extend Express Request to include logger
declare global {
  namespace Express {
    interface Request {
      logger: ReturnType<typeof createLogger>;
      requestId: string;
      startTime: number;
    }
  }
}

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Add request ID and start time to request
  req.requestId = requestId;
  req.startTime = startTime;

  // Create request-specific logger
  req.logger = createLogger('http').child({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): any {
    const duration = Date.now() - startTime;

    // Only log slow requests or errors
    if (duration > 1000 || res.statusCode >= 400) {
      req.logger.warn('Slow request or error', {
        statusCode: res.statusCode,
        duration,
        method: req.method,
        url: req.url,
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};
