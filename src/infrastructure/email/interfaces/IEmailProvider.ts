import { EmailData, EmailResult, ProviderStats } from '../types';

/**
 * Email provider interface defining provider-specific operations
 */
export interface IEmailProvider {
  /**
   * Send an email using this provider
   * @param emailData - Email data to send
   * @returns Promise<EmailResult> - Result of the email sending operation
   */
  sendEmail(emailData: EmailData): Promise<EmailResult>;

  /**
   * Validate provider configuration
   * @returns boolean - True if configuration is valid
   */
  validateConfiguration(): boolean;

  /**
   * Get provider name
   * @returns string - Provider name
   */
  getProviderName(): string;

  /**
   * Check if provider is healthy and available
   * @returns Promise<boolean> - True if provider is healthy
   */
  isHealthy(): Promise<boolean>;

  /**
   * Get provider statistics
   * @returns Promise<ProviderStats> - Provider statistics
   */
  getStats(): Promise<ProviderStats>;
}
