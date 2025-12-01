import { ShutdownManager } from './ShutdownManager';

export class SignalHandler {
  private static instance: SignalHandler;
  private readonly shutdownManager: ShutdownManager;
  private isHandlingSignal = false;
  private handlersRegistered = false;

  // Store bound handlers to enable proper cleanup
  private boundHandlers = {
    sigterm: null as ((signal: string) => Promise<void>) | null,
    sigint: null as ((signal: string) => Promise<void>) | null,
    uncaughtException: null as ((error: Error) => void) | null,
    unhandledRejection: null as ((reason: any, promise: Promise<any>) => void) | null,
  };

  private constructor() {
    this.shutdownManager = ShutdownManager.getInstance();
  }

  static getInstance(): SignalHandler {
    if (!SignalHandler.instance) {
      SignalHandler.instance = new SignalHandler();
    }
    return SignalHandler.instance;
  }

  registerHandlers(): void {
    // Check if handlers are already registered
    if (this.handlersRegistered) {
      return;
    }

    // Check if we've already added listeners to avoid duplicates
    const sigtermCount = process.listenerCount('SIGTERM');
    const sigintCount = process.listenerCount('SIGINT');
    const uncaughtCount = process.listenerCount('uncaughtException');
    const unhandledCount = process.listenerCount('unhandledRejection');

    // If any significant number of listeners exist, skip registration
    // (ts-node-dev and winston add their own, so we allow a few)
    if (sigtermCount >= 2 || sigintCount >= 2 || uncaughtCount >= 10 || unhandledCount >= 10) {
      this.handlersRegistered = true;
      return;
    }

    try {
      // Increase max listeners for development (ts-node-dev, winston, etc.)
      if (process.env.NODE_ENV === 'development') {
        process.setMaxListeners(20);
      }

      // Create bound handlers
      this.boundHandlers.sigterm = this.handleSignal.bind(this, 'SIGTERM');
      this.boundHandlers.sigint = this.handleSignal.bind(this, 'SIGINT');
      this.boundHandlers.uncaughtException = this.handleUncaughtException.bind(this);
      this.boundHandlers.unhandledRejection = this.handleUnhandledRejection.bind(this);

      // Handle SIGTERM (graceful shutdown signal from container orchestration)
      process.on('SIGTERM', this.boundHandlers.sigterm);

      // Handle SIGINT (Ctrl+C)
      process.on('SIGINT', this.boundHandlers.sigint);

      // Handle uncaught exceptions
      process.on('uncaughtException', this.boundHandlers.uncaughtException);

      // Handle unhandled promise rejections
      process.on('unhandledRejection', this.boundHandlers.unhandledRejection);

      this.handlersRegistered = true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove all registered handlers (useful for cleanup)
   */
  unregisterHandlers(): void {
    if (!this.handlersRegistered) {
      return;
    }

    try {
      if (this.boundHandlers.sigterm) {
        process.off('SIGTERM', this.boundHandlers.sigterm);
      }
      if (this.boundHandlers.sigint) {
        process.off('SIGINT', this.boundHandlers.sigint);
      }
      if (this.boundHandlers.uncaughtException) {
        process.off('uncaughtException', this.boundHandlers.uncaughtException);
      }
      if (this.boundHandlers.unhandledRejection) {
        process.off('unhandledRejection', this.boundHandlers.unhandledRejection);
      }

      this.handlersRegistered = false;
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  private async handleSignal(signal: string): Promise<void> {
    if (this.isHandlingSignal) {
      return;
    }

    this.isHandlingSignal = true;

    try {
      await this.shutdownManager.initiateShutdown(signal);
    } catch (error) {
      process.exit(1);
    }
  }

  private handleUncaughtException(error: Error): void {
    // Give some time for logging before exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }

  private handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    // Give some time for logging before exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }

  // Method to reset the registration flag (useful for testing)
  resetRegistration(): void {
    this.unregisterHandlers();
    this.handlersRegistered = false;
  }
}
