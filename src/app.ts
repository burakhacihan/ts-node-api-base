import 'reflect-metadata';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import { EnvironmentValidator } from './utils/envValidator';
import { initializeContainer } from './container';
import { initializeDatabase } from './config/db';
import { errorHandler } from './middlewares/error.middleware';
import { bootstrapAdminUser } from './utils/bootstrapAdmin';
import { setupSwagger } from './middlewares/swagger.middleware';
import { setupMiddlewares } from './config/middlewares';
import { logger } from './infrastructure/logging';
import { ShutdownManager } from './infrastructure/shutdown/ShutdownManager';
import { SignalHandler } from './infrastructure/shutdown/SignalHandler';
import { setupRoutes } from './config/routes';
import { setupHealthChecks } from './config/health';
import { initializeInfrastructure } from './config/infrastructure';

// Load environment variables and validate
dotenv.config();
EnvironmentValidator.validate();

const app: Express = express();
const port = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    logger.info('Starting server initialization...');

    // 1. Initialize DI Container (async now, with lazy imports)
    await initializeContainer();
    logger.info('DI Container initialized successfully');

    // 2. Initialize database
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // 3. Setup shutdown handlers
    const shutdownManager = ShutdownManager.getInstance();
    SignalHandler.getInstance().registerHandlers();

    // 4. Setup middlewares
    setupMiddlewares(app);

    // 5. Setup Swagger
    setupSwagger(app);

    // 6. Setup health checks
    setupHealthChecks(app);

    // 7. Setup routes
    setupRoutes(app);

    // 8. Setup error handler (must be last)
    app.use(errorHandler as any);

    // 9. Initialize infrastructure (cron, queues)
    await initializeInfrastructure();

    // 10. Bootstrap admin user
    await bootstrapAdminUser();

    // 11. Start HTTP server
    const server = app.listen(port, () => {
      logger.info(`Server running at http://localhost:${port}`, {
        port,
        environment: process.env.NODE_ENV || 'development',
      });
    });

    shutdownManager.setServer(server);
  } catch (error) {
    logger.error('Failed to start server', { error: error as Error });
    process.exit(1);
  }
}

startServer().catch((error) => {
  logger.error('Critical startup error', { error: error as Error });
  process.exit(1);
});

export default app;
