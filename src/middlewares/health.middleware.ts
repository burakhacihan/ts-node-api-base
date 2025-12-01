import { Request, Response } from 'express';
import { ShutdownManager } from '../infrastructure/shutdown/ShutdownManager';
import { CronJobManager } from '../infrastructure/cron/CronJobManager';
import { QueueInitializer } from '../infrastructure/queue/QueueInitializer';
import { AppDataSource } from '../config/database';
import { HttpStatusCode } from '@/core/constants/http-status';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: { status: 'healthy' | 'unhealthy'; details?: string };
    cron: { status: 'healthy' | 'unhealthy'; details?: string };
    queue: { status: 'healthy' | 'unhealthy'; details?: string };
  };
  shutdown?: {
    inProgress: boolean;
    startTime: number | null;
    duration: number;
  };
}

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const shutdownManager = ShutdownManager.getInstance();
  const shutdownProgress = shutdownManager.getShutdownProgress();

  // During shutdown, return degraded status
  if (shutdownProgress.isShuttingDown) {
    const healthStatus: HealthStatus = {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { status: 'unhealthy', details: 'Shutdown in progress' },
        cron: { status: 'unhealthy', details: 'Shutdown in progress' },
        queue: { status: 'unhealthy', details: 'Shutdown in progress' },
      },
      shutdown: {
        inProgress: shutdownProgress.isShuttingDown,
        startTime: shutdownProgress.startTime,
        duration: shutdownProgress.duration,
      },
    };
    res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json(healthStatus);
    return;
  }

  // Check individual services
  const services = await checkServices();

  const overallStatus = determineOverallStatus(services);
  const statusCode =
    overallStatus === 'healthy'
      ? HttpStatusCode.OK
      : overallStatus === 'degraded'
        ? HttpStatusCode.SERVICE_UNAVAILABLE
        : HttpStatusCode.INTERNAL_SERVER_ERROR;

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services,
  };

  res.status(statusCode).json(healthStatus);
};

async function checkServices(): Promise<HealthStatus['services']> {
  const services: HealthStatus['services'] = {
    database: { status: 'unhealthy' },
    cron: { status: 'unhealthy' },
    queue: { status: 'unhealthy' },
  };

  // Check database
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('SELECT 1');
      services.database.status = 'healthy';
    } else {
      services.database.details = 'Database not initialized';
    }
  } catch (error) {
    services.database.details = `Database error: ${(error as Error).message}`;
  }

  // Check cron jobs
  try {
    const cronManager = CronJobManager.getInstance();
    const jobs = cronManager.getAllJobs();
    const runningJobs = cronManager.getRunningJobsCount();

    if (jobs.size > 0) {
      services.cron.status = 'healthy';
      services.cron.details = `${jobs.size} jobs registered, ${runningJobs} running`;
    } else {
      services.cron.details = 'No cron jobs registered';
    }
  } catch (error) {
    services.cron.details = `Cron error: ${(error as Error).message}`;
  }

  // Check queue system
  try {
    const queueInitializer = QueueInitializer.getInstance();
    const activeJobs = queueInitializer.getActiveJobsCount();

    if (!queueInitializer.isShutdownInProgress()) {
      services.queue.status = 'healthy';
      services.queue.details = `${activeJobs} active jobs`;
    } else {
      services.queue.details = 'Queue shutdown in progress';
    }
  } catch (error) {
    services.queue.details = `Queue error: ${(error as Error).message}`;
  }

  return services;
}

function determineOverallStatus(
  services: HealthStatus['services'],
): 'healthy' | 'degraded' | 'unhealthy' {
  const unhealthyCount = Object.values(services).filter((s) => s.status === 'unhealthy').length;

  if (unhealthyCount === 0) return 'healthy';
  if (unhealthyCount === Object.keys(services).length) return 'unhealthy';
  return 'degraded';
}

export const readinessCheck = async (req: Request, res: Response): Promise<void> => {
  const shutdownManager = ShutdownManager.getInstance();

  if (shutdownManager.isShutdownInProgress()) {
    res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
      status: 'not ready',
      reason: 'Application is shutting down',
    });
    return;
  }

  // Check if all critical services are ready
  const services = await checkServices();
  const criticalServices = ['database'];
  const criticalServicesHealthy = criticalServices.every(
    (service) => services[service as keyof typeof services].status === 'healthy',
  );

  if (criticalServicesHealthy) {
    res.status(HttpStatusCode.OK).json({ status: 'ready' });
  } else {
    res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
      status: 'not ready',
      reason: 'Critical services not healthy',
    });
  }
};

export const livenessCheck = (req: Request, res: Response): void => {
  const shutdownManager = ShutdownManager.getInstance();

  if (shutdownManager.isShutdownInProgress()) {
    res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
      status: 'not alive',
      reason: 'Application is shutting down',
    });
    return;
  }

  res.status(HttpStatusCode.OK).json({ status: 'alive' });
};
