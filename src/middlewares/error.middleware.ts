import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/exceptions';
import { getHttpStatusMessage, HttpStatusCode } from '@/core/constants/http-status';
import { logger } from '../infrastructure/logging';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  // Use request logger if available, otherwise use global logger
  const requestLogger = req.logger || logger;

  if (error instanceof HttpException) {
    requestLogger.warn('HTTP Exception occurred', {
      status: error.status,
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });

    return res.status(error.status).json({
      status: error.status,
      message: error.message,
    });
  }

  // Log unexpected errors
  requestLogger.error('Unhandled error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    status: HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: getHttpStatusMessage(HttpStatusCode.INTERNAL_SERVER_ERROR),
  });
};
