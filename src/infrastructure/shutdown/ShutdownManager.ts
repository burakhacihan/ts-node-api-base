import { createLogger, ILogger } from '../logging';
import { Server } from 'http';
import { AppDataSource } from '../../config/database';
import { CronJobManager } from '../cron/CronJobManager';
import { QueueInitializer } from '../queue/QueueInitializer';

export interface ShutdownConfig {
  timeout: number; // milliseconds
  forceExitAfter: number; // milliseconds
  healthCheckGracePeriod: number; // milliseconds
}

export class ShutdownManager {
  private static instance: ShutdownManager;
  private isShuttingDown = false;
  private shutdownStartTime: number | null = null;
  private activeConnections = 0;
  private server: Server | null = null;
  private config: ShutdownConfig;

  private constructor() {
    this.config = {
      timeout: parseInt(process.env.SHUTDOWN_TIMEOUT || '30000'),
      forceExitAfter: parseInt(process.env.FORCE_EXIT_AFTER || '35000'),
      healthCheckGracePeriod: parseInt(process.env.HEALTH_CHECK_GRACE_PERIOD || '5000'),
    };
  }

  static getInstance(): ShutdownManager {
    if (!ShutdownManager.instance) {
      ShutdownManager.instance = new ShutdownManager();
    }
    return ShutdownManager.instance;
  }

  setServer(server: Server): void {
    this.server = server;
  }

  isShutdownInProgress(): boolean {
    return this.isShuttingDown;
  }

  getShutdownProgress(): { isShuttingDown: boolean; startTime: number | null; duration: number } {
    return {
      isShuttingDown: this.isShuttingDown,
      startTime: this.shutdownStartTime,
      duration: this.shutdownStartTime ? Date.now() - this.shutdownStartTime : 0,
    };
  }

  incrementConnections(): void {
    this.activeConnections++;
  }

  decrementConnections(): void {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
  }

  getActiveConnections(): number {
    return this.activeConnections;
  }

  async initiateShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    this.shutdownStartTime = Date.now();

    // Set up force exit timer
    const forceExitTimer = setTimeout(() => {
      process.exit(1);
    }, this.config.forceExitAfter);

    try {
      await this.performShutdown();
      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  }

  private async performShutdown(): Promise<void> {
    const shutdownSteps = [
      { name: 'Stop accepting new connections', fn: () => this.stopAcceptingConnections() },
      { name: 'Stop cron jobs', fn: () => this.stopCronJobs() },
      { name: 'Stop queue processing', fn: () => this.stopQueueProcessing() },
      { name: 'Close database connections', fn: () => this.closeDatabaseConnections() },
      { name: 'Wait for active connections', fn: () => this.waitForActiveConnections() },
      { name: 'Close HTTP server', fn: () => this.closeHttpServer() },
    ];

    for (const step of shutdownSteps) {
      try {
        await step.fn();
      } catch (error) {
        // Continue with other steps even if one fails
      }
    }
  }

  private async stopAcceptingConnections(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
  }

  private async stopCronJobs(): Promise<void> {
    try {
      await CronJobManager.getInstance().stopAll();
    } catch {}
  }

  private async stopQueueProcessing(): Promise<void> {
    try {
      await QueueInitializer.getInstance().shutdown();
    } catch {}
  }

  private async closeDatabaseConnections(): Promise<void> {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    } catch {}
  }

  private async waitForActiveConnections(): Promise<void> {
    const maxWaitTime = this.config.timeout - 5000; // Leave 5 seconds for other operations
    const startTime = Date.now();

    while (this.activeConnections > 0 && Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (this.activeConnections > 0) {
      // Log warning about active connections not closed
    }
  }

  private async closeHttpServer(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          resolve();
        });
      });
    }
  }
}
