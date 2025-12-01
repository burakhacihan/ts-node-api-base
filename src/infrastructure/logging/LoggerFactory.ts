import { ILogger } from './interfaces/ILogger';
import { WinstonLogger } from './providers/winston.logger';
import { ConsoleLogger } from './providers/console.logger';

export enum LoggerProvider {
  WINSTON = 'winston',
  CONSOLE = 'console',
}

export class LoggerFactory {
  private static instance: LoggerFactory;
  private currentProvider: LoggerProvider;
  private loggerInstance: ILogger | null = null;

  private constructor() {
    this.currentProvider = this.getProviderFromEnv();
  }

  public static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    return LoggerFactory.instance;
  }

  private getProviderFromEnv(): LoggerProvider {
    const provider = process.env.LOGGER_PROVIDER as LoggerProvider;
    return Object.values(LoggerProvider).includes(provider) ? provider : LoggerProvider.WINSTON;
  }

  public createLogger(service?: string): ILogger {
    const baseContext = service ? { service } : {};

    try {
      switch (this.currentProvider) {
        case LoggerProvider.WINSTON:
          return new WinstonLogger(baseContext);
        case LoggerProvider.CONSOLE:
          return new ConsoleLogger(baseContext);
        default:
          // Fallback to console logger
          return new ConsoleLogger(baseContext);
      }
    } catch (error) {
      // If the primary logger fails, fallback to console
      console.warn(
        `Failed to create ${this.currentProvider} logger, falling back to console:`,
        error,
      );
      return new ConsoleLogger(baseContext);
    }
  }

  public getGlobalLogger(): ILogger {
    if (!this.loggerInstance) {
      this.loggerInstance = this.createLogger('app');
    }
    return this.loggerInstance;
  }

  public setProvider(provider: LoggerProvider): void {
    this.currentProvider = provider;
    this.loggerInstance = null; // Reset instance to recreate with new provider
  }
}
