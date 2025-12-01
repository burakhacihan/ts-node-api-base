import winston from 'winston';
import { ILogger } from '../interfaces/ILogger';
import { LogLevel } from '../enums/LogLevel';
import { LogContext } from '../interfaces/LogContext';

// Singleton base logger to prevent multiple exception/rejection handlers
let baseWinstonLogger: winston.Logger | null = null;
let handlersRegistered = false;

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;
  private defaultContext: LogContext;

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
    this.logger = this.getOrCreateBaseLogger();
  }

  private getOrCreateBaseLogger(): winston.Logger {
    // Return existing base logger if already created
    if (baseWinstonLogger) {
      return baseWinstonLogger;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

    const formats = [winston.format.timestamp(), winston.format.errors({ stack: true })];

    if (isProduction) {
      // Production: JSON format for structured logging
      formats.push(
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...this.defaultContext,
            ...meta,
          });
        }),
      );
    } else {
      // Development: Pretty console format
      formats.push(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const contextStr =
            Object.keys(meta).length > 0
              ? `\n${JSON.stringify({ ...this.defaultContext, ...meta }, null, 2)}`
              : '';
          return `${timestamp} [${level}]: ${message}${contextStr}`;
        }),
      );
    }

    const transports = [
      new winston.transports.Console(),
      // Add file transports for production
      ...(isProduction
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            }),
          ]
        : []),
    ];

    // Exception and rejection handlers (only in production or once in development)
    const exceptionHandlers: winston.transport[] = [];
    const rejectionHandlers: winston.transport[] = [];

    if (isProduction) {
      // Production: Always handle exceptions and rejections
      exceptionHandlers.push(
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
      );
      rejectionHandlers.push(
        new winston.transports.File({ filename: 'logs/rejections.log' }),
      );
    } else if (!handlersRegistered) {
      // Development: Only register handlers once to avoid MaxListeners warning
      exceptionHandlers.push(
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
      );
      rejectionHandlers.push(
        new winston.transports.File({ filename: 'logs/rejections.log' }),
      );
      handlersRegistered = true;

      // Increase max listeners for development (ts-node-dev, winston, etc.)
      process.setMaxListeners(30);
    }

    baseWinstonLogger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(...formats),
      transports,
      exceptionHandlers: exceptionHandlers.length > 0 ? exceptionHandlers : undefined,
      rejectionHandlers: rejectionHandlers.length > 0 ? rejectionHandlers : undefined,
    });

    return baseWinstonLogger;
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.mergeContext(context));
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(message, this.mergeContext(context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.mergeContext(context));
  }

  child(context: LogContext): ILogger {
    return new WinstonLogger({ ...this.defaultContext, ...context });
  }

  setLevel(level: LogLevel): void {
    this.logger.level = level;
  }

  private mergeContext(context?: LogContext): LogContext {
    return {
      ...this.defaultContext,
      ...context,
      timestamp: new Date(),
    };
  }

  /**
   * Cleanup method for testing or hot-reload scenarios
   * Call this to reset the singleton logger
   */
  static reset(): void {
    if (baseWinstonLogger) {
      baseWinstonLogger.close();
      baseWinstonLogger = null;
      handlersRegistered = false;
    }
  }
}
