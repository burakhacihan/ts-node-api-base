export interface EmailData {
  to: string | string[];
  from: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  contentDisposition?: 'attachment' | 'inline';
}

export interface EmailResult {
  success: boolean;
  emailId: string;
  provider: string;
  messageId?: string;
  error?: string;
  timestamp: Date;
  retryCount?: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // in milliseconds
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ProviderStats {
  provider: string;
  totalSent: number;
  totalFailed: number;
  successRate: number;
  averageResponseTime: number;
  lastUsed: Date;
}

export interface EmailConfiguration {
  primaryProvider: string;
  fallbackProvider?: string;
  providers: {
    [key: string]: ProviderConfig;
  };
  retry: RetryConfig;
  queue: {
    enabled: boolean;
    name: string;
    priority: number;
  };
  tracking: {
    enabled: boolean;
    openTracking: boolean;
    clickTracking: boolean;
  };
}

export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  [key: string]: any;
}
