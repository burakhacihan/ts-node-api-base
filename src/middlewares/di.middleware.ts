import { Request, Response, NextFunction } from 'express';
import { resolve } from '../container';

/**
 * Middleware to inject DI container into request object
 */
export const diMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Add container resolve function to request for potential use
  (req as any).resolve = resolve;
  next();
};

/**
 * Factory function to create controller instances with DI
 */
export const createController = <T>(token: string): T => {
  try {
    return resolve<T>(token);
  } catch (error) {
    throw new Error(`Controller resolution failed: ${token}`);
  }
};

/**
 * Helper to get controller instance with error handling
 */
export const getController = <T>(token: string): T => {
  return createController<T>(token);
};
