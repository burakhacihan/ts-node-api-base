import { Express } from 'express';
import { healthCheck, readinessCheck, livenessCheck } from '../middlewares/health.middleware';

export function setupHealthChecks(app: Express): void {
  app.get('/health', healthCheck);
  app.get('/ready', readinessCheck);
  app.get('/live', livenessCheck);
}
