export enum NotificationPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

export interface NotificationData {
  id: string;
  type: string;
  priority: NotificationPriority;
  recipient: string;
  subject?: string;
  content: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  sentAt: Date;
}
