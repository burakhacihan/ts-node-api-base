export interface LogContext {
  [key: string]: any;
  requestId?: string;
  userId?: string;
  correlationId?: string;
  timestamp?: Date;
  service?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: Error | string;
}
