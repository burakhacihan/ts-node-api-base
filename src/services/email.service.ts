import { injectable, inject } from 'tsyringe';
import { IEmailService } from '../infrastructure/email/interfaces/IEmailService';
import { IEmailProvider } from '../infrastructure/email/interfaces/IEmailProvider';
import { EmailData, RetryConfig, EmailConfiguration } from '../infrastructure/email/types';
import { QueueManager } from '../infrastructure/queue/QueueManager';
import { EmailSendResponseDto, EmailQueueResponseDto } from '../dtos/email';

@injectable()
export class EmailService implements IEmailService {
  private readonly providers: Map<string, IEmailProvider>;
  private readonly queueManager: QueueManager;
  private readonly config: EmailConfiguration;

  constructor(@inject('QueueManager') queueManager: QueueManager) {
    this.providers = new Map();
    this.queueManager = queueManager;
    this.config = this.loadConfiguration();
    this.initializeProviders();
  }

  private loadConfiguration(): EmailConfiguration {
    return {
      primaryProvider: process.env.EMAIL_PRIMARY_PROVIDER || 'sendgrid',
      fallbackProvider: process.env.EMAIL_FALLBACK_PROVIDER || 'ses',
      providers: {
        sendgrid: {
          enabled: process.env.SENDGRID_ENABLED === 'true',
          priority: 1,
        },
        ses: {
          enabled: process.env.AWS_SES_ENABLED === 'true',
          priority: 2,
        },
        smtp: {
          enabled: process.env.SMTP_ENABLED === 'true',
          priority: 3,
        },
      },
      retry: {
        maxAttempts: parseInt(process.env.EMAIL_MAX_RETRIES || '3'),
        baseDelay: parseInt(process.env.EMAIL_BASE_DELAY || '1000'),
        maxDelay: parseInt(process.env.EMAIL_MAX_DELAY || '30000'),
        backoffMultiplier: parseFloat(process.env.EMAIL_BACKOFF_MULTIPLIER || '2'),
      },
      queue: {
        enabled: process.env.EMAIL_QUEUE_ENABLED === 'true',
        name: process.env.EMAIL_QUEUE_NAME || 'email',
        priority: parseInt(process.env.EMAIL_QUEUE_PRIORITY || '0'),
      },
      tracking: {
        enabled: process.env.EMAIL_TRACKING_ENABLED === 'true',
        openTracking: process.env.EMAIL_OPEN_TRACKING === 'true',
        clickTracking: process.env.EMAIL_CLICK_TRACKING === 'true',
      },
    };
  }

  private initializeProviders(): void {
    // This would be done through DI container in a real implementation
    // For now, we'll create instances manually
  }

  async sendEmail(emailData: EmailData): Promise<EmailSendResponseDto> {
    const primaryProvider = this.providers.get(this.config.primaryProvider);
    if (!primaryProvider) {
      throw new Error(`Primary provider ${this.config.primaryProvider} not available`);
    }

    try {
      const result = await primaryProvider.sendEmail(emailData);

      return EmailSendResponseDto.fromEmailResult(result);
    } catch (error) {
      if (this.config.fallbackProvider) {
        const fallbackProvider = this.providers.get(this.config.fallbackProvider);
        if (fallbackProvider) {
          try {
            const fallbackResult = await fallbackProvider.sendEmail(emailData);

            return EmailSendResponseDto.fromEmailResult(fallbackResult);
          } catch (fallbackError) {
            throw fallbackError;
          }
        }
      }

      throw error;
    }
  }

  async sendEmailWithRetry(
    emailData: EmailData,
    retryConfig?: RetryConfig,
  ): Promise<EmailSendResponseDto> {
    const config = retryConfig || this.config.retry;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await this.sendEmail(emailData);

        const resultWithRetry = { ...result, retryCount: attempt - 1 };
        return resultWithRetry;
      } catch (error) {
        lastError = error as Error;
        if (attempt < config.maxAttempts) {
          const delay = Math.min(
            config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
            config.maxDelay,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Email sending failed after all retry attempts');
  }

  async queueEmail(emailData: EmailData, delay?: number): Promise<EmailQueueResponseDto> {
    if (!this.config.queue.enabled) {
      throw new Error('Email queue is not enabled');
    }

    const jobId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.queueManager.publish(
      this.config.queue.name,
      {
        jobId,
        emailData,
        delay,
        timestamp: Date.now(),
      },
      {
        priority: this.config.queue.priority,
      },
    );

    return EmailQueueResponseDto.fromJobId(jobId);
  }
}
