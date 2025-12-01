import { injectable, inject } from 'tsyringe';
import { BaseConsumer } from './BaseConsumer';
import { QueueMessage } from '../interfaces/IQueue';
import { QueueManager } from '../QueueManager';
import { EmailService } from '../../../services/email.service';
import { EmailData } from '../../email/types';

interface EmailQueueData {
  jobId: string;
  emailData: EmailData;
  delay?: number;
  timestamp: number;
}

@injectable()
export class EmailConsumer extends BaseConsumer<EmailQueueData> {
  constructor(
    @inject('QueueManager') queueManager: QueueManager,
    @inject('EmailService') private emailService: EmailService,
  ) {
    super('email', queueManager);
  }

  async handleMessage(message: QueueMessage<EmailQueueData>): Promise<void> {
    const { jobId, emailData, delay } = message.data;

    try {
      // Apply delay if specified
      if (delay && delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Send the email using the email service
      const result = await this.emailService.sendEmail(emailData);
    } catch (error) {
      throw error;
    }
  }
}
