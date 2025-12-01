import { IEmailProvider } from './interfaces/IEmailProvider';
import { EmailData, EmailResult, ProviderStats } from './types';

export abstract class BaseEmailProvider implements IEmailProvider {
  protected readonly providerName: string;
  protected readonly config: any;
  protected stats: ProviderStats;

  constructor(providerName: string, config: any) {
    this.providerName = providerName;
    this.config = config;
    this.stats = {
      provider: providerName,
      totalSent: 0,
      totalFailed: 0,
      successRate: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
    };
  }

  abstract sendEmail(emailData: EmailData): Promise<EmailResult>;
  abstract validateConfiguration(): boolean;
  abstract isHealthy(): Promise<boolean>;

  getProviderName(): string {
    return this.providerName;
  }

  async getStats(): Promise<ProviderStats> {
    return this.stats;
  }

  protected updateStats(success: boolean, responseTime: number): void {
    this.stats.totalSent += success ? 1 : 0;
    this.stats.totalFailed += success ? 0 : 1;
    this.stats.successRate = this.stats.totalSent / (this.stats.totalSent + this.stats.totalFailed);
    this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
    this.stats.lastUsed = new Date();
  }

  protected validateEmailData(emailData: EmailData): void {
    if (!emailData.to || (Array.isArray(emailData.to) && emailData.to.length === 0)) {
      throw new Error('Recipient email is required');
    }
    if (!emailData.from) {
      throw new Error('Sender email is required');
    }
    if (!emailData.subject) {
      throw new Error('Email subject is required');
    }
    if (!emailData.htmlContent && !emailData.textContent) {
      throw new Error('Email content (HTML or text) is required');
    }
  }

  protected createEmailResult(
    success: boolean,
    emailId: string,
    messageId?: string,
    error?: string,
  ): EmailResult {
    return {
      success,
      emailId,
      provider: this.providerName,
      messageId,
      error,
      timestamp: new Date(),
    };
  }

  protected async executeWithTiming<T>(
    operation: () => Promise<T>,
  ): Promise<{ result: T; responseTime: number }> {
    const startTime = Date.now();
    const result = await operation();
    const responseTime = Date.now() - startTime;
    return { result, responseTime };
  }
}
