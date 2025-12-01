import { LogLevel } from '../enums/LogLevel';
import { LogContext } from './LogContext';

export interface ILogger {
  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext): void;

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): ILogger;

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void;
}
