import { ILogger } from '../interfaces/ILogger';
import { LogLevel } from '../enums/LogLevel';
import { LogContext } from '../interfaces/LogContext';

export class ConsoleLogger implements ILogger {
  private level: LogLevel = LogLevel.INFO;
  private defaultContext: LogContext;

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
    const envLevel = process.env.LOG_LEVEL as LogLevel;
    if (envLevel && Object.values(LogLevel).includes(envLevel)) {
      this.level = envLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.defaultContext, ...context };
    const contextStr =
      Object.keys(mergedContext).length > 0 ? ` | Context: ${JSON.stringify(mergedContext)}` : '';

    return `${timestamp} [${level.toUpperCase()}]: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  child(context: LogContext): ILogger {
    return new ConsoleLogger({ ...this.defaultContext, ...context });
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}
