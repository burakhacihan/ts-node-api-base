import { injectable } from 'tsyringe';
import { BaseEmailProvider } from '../BaseEmailProvider';
import { EmailData, EmailResult } from '../types';

interface SesConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  fromEmail: string;
}

@injectable()
export class SesProvider extends BaseEmailProvider {
  constructor() {
    const config: SesConfig = {
      region: process.env.AWS_SES_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      fromEmail: process.env.AWS_SES_FROM_EMAIL || '',
    };
    super('SES', config);
  }

  validateConfiguration(): boolean {
    return !!(this.config.accessKeyId && this.config.secretAccessKey && this.config.fromEmail);
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Implement health check logic for SES
      return true;
    } catch (error) {
      return false;
    }
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    this.validateEmailData(emailData);

    if (!this.validateConfiguration()) {
      throw new Error('SES configuration is invalid');
    }

    try {
      const { result, responseTime } = await this.executeWithTiming(async () => {
        // Implement SES API call here
        // This is a placeholder implementation
        const messageId = `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 150));

        return { messageId };
      });

      this.updateStats(true, responseTime);

      return this.createEmailResult(true, `ses_${Date.now()}`, result.messageId);
    } catch (error) {
      this.updateStats(false, 0);
      return this.createEmailResult(false, `ses_${Date.now()}`, undefined, error as string);
    }
  }
}
