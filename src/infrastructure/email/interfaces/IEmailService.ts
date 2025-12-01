import { EmailData, RetryConfig } from '../types';
import { EmailSendResponseDto, EmailQueueResponseDto } from '../../../dtos/email';

/**
 * Email service interface defining all email-related operations
 */
export interface IEmailService {
  /**
   * Send an email using the configured provider
   * @param emailData - Email data to send
   * @returns Promise<EmailSendResponseDto> - Result of the email sending operation
   */
  sendEmail(emailData: EmailData): Promise<EmailSendResponseDto>;

  /**
   * Send an email with retry mechanism
   * @param emailData - Email data to send
   * @param retryConfig - Retry configuration
   * @returns Promise<EmailSendResponseDto> - Result of the email sending operation
   */
  sendEmailWithRetry(
    emailData: EmailData,
    retryConfig?: RetryConfig,
  ): Promise<EmailSendResponseDto>;

  /**
   * Queue an email for later sending
   * @param emailData - Email data to queue
   * @param delay - Delay in milliseconds before sending
   * @returns Promise<EmailQueueResponseDto> - Job information of the queued email
   */
  queueEmail(emailData: EmailData, delay?: number): Promise<EmailQueueResponseDto>;
}
