import { Request, Response, NextFunction } from 'express';
import { ShutdownManager } from '../infrastructure/shutdown/ShutdownManager';

export const connectionTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const shutdownManager = ShutdownManager.getInstance();

  // Track connection
  shutdownManager.incrementConnections();

  // Log connection start
  req.logger?.debug('Connection started', {
    url: req.url,
    method: req.method,
    activeConnections: shutdownManager.getActiveConnections(),
  });

  // Override res.end to track connection completion
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): any {
    shutdownManager.decrementConnections();

    req.logger?.debug('Connection completed', {
      url: req.url,
      method: req.method,
      statusCode: res.statusCode,
      activeConnections: shutdownManager.getActiveConnections(),
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};
