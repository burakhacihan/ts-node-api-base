import { Express } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { diMiddleware } from '../middlewares/di.middleware';
import { loggingMiddleware } from '../middlewares/logging.middleware';
import { connectionTrackingMiddleware } from '../middlewares/connection.middleware';
import { globalRateLimiter } from '../middlewares/rateLimit.middleware';
import { apiVersionMiddleware } from '../middlewares/apiVersion.middleware';

export function setupMiddlewares(app: Express): void {
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [
        'http://localhost:3000',
      ],
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add DI middleware early in the chain
  app.use(diMiddleware);

  // Add logging middleware early in the chain
  app.use(loggingMiddleware);

  // Add connection tracking middleware
  app.use(connectionTrackingMiddleware);

  // Apply global rate limiter
  app.use(globalRateLimiter);

  // API Versioning middleware
  app.use(apiVersionMiddleware);
}
