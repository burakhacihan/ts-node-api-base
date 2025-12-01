import { CronJob } from 'cron';
import { BaseCronJob } from './BaseCronJob';

interface RunningJob {
  job: CronJob;
  startTime: number;
  isRunning: boolean;
}

export class CronJobManager {
  private static instance: CronJobManager;
  private jobs: Map<string, CronJob> = new Map();
  private runningJobs: Map<string, RunningJob> = new Map();
  private isShuttingDown = false;

  private constructor() {}

  static getInstance(): CronJobManager {
    if (!CronJobManager.instance) {
      CronJobManager.instance = new CronJobManager();
    }
    return CronJobManager.instance;
  }

  async registerJob(job: BaseCronJob): Promise<void> {
    if (!job.isEnabled()) {
      return;
    }

    if (this.jobs.has(job.getName())) {
      return;
    }

    try {
      const cronJob = new CronJob(
        job.getSchedule(),
        async () => {
          if (this.isShuttingDown) {
            return;
          }

          const jobId = `${job.getName()}-${Date.now()}`;
          const runningJob: RunningJob = {
            job: cronJob,
            startTime: Date.now(),
            isRunning: true,
          };

          this.runningJobs.set(jobId, runningJob);

          try {
            await job.execute();
          } catch (error) {
            await job.handleError(error as Error);
          } finally {
            runningJob.isRunning = false;
            this.runningJobs.delete(jobId);
          }
        },
        null,
        false,
        job.getTimezone(),
      );

      this.jobs.set(job.getName(), cronJob);
    } catch (error) {
      throw error;
    }
  }

  async startAll(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    for (const [name, job] of this.jobs) {
      try {
        job.start();
      } catch {}
    }
  }

  async stopAll(): Promise<void> {
    this.isShuttingDown = true;

    // Stop scheduling new jobs
    for (const [name, job] of this.jobs) {
      try {
        job.stop();
      } catch {}
    }

    // Wait for running jobs to complete
    const maxWaitTime = 20000; // 20 seconds
    const startTime = Date.now();

    while (this.runningJobs.size > 0 && Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  getJob(name: string): CronJob | undefined {
    return this.jobs.get(name);
  }

  getAllJobs(): Map<string, CronJob> {
    return new Map(this.jobs);
  }

  getRunningJobsCount(): number {
    return this.runningJobs.size;
  }

  isShutdownInProgress(): boolean {
    return this.isShuttingDown;
  }
}
