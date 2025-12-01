import { LoggerFactory } from './LoggerFactory';
import { ILogger } from './interfaces/ILogger';

// Global logger instance
export const logger: ILogger = LoggerFactory.getInstance().getGlobalLogger();

// Factory function for service-specific loggers
export const createLogger = (service: string): ILogger => {
  return LoggerFactory.getInstance().createLogger(service);
};

// Re-export types for convenience
export { ILogger } from './interfaces/ILogger';
export { LogLevel } from './enums/LogLevel';
export { LogContext } from './interfaces/LogContext';
export { LoggerProvider } from './LoggerFactory';
