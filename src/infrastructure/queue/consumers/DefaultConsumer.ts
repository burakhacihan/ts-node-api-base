import { injectable, inject } from 'tsyringe';
import { BaseConsumer } from './BaseConsumer';
import { QueueMessage } from '../interfaces/IQueue';
import { QueueManager } from '../QueueManager';

@injectable()
export class DefaultConsumer extends BaseConsumer<any> {
  constructor(@inject('QueueManager') queueManager: QueueManager) {
    super('default', queueManager);
  }

  async handleMessage(message: QueueMessage<any>): Promise<void> {
    try {
      // Generic message processing
      // This could route to different handlers based on message content
      await this.processGenericMessage(message);
    } catch (error) {
      throw error;
    }
  }

  private async processGenericMessage(message: QueueMessage<any>): Promise<void> {
    const { data } = message;

    // Example: Route based on message type
    if (data.type) {
      switch (data.type) {
        case 'cleanup':
          await this.processCleanupTask(data);
          break;
        case 'backup':
          await this.processBackupTask(data);
          break;
        case 'maintenance':
          await this.processMaintenanceTask(data);
          break;
        default:
          // Unknown type handling
          break;
      }
    } else {
      // Generic processing for messages without specific type
    }
  }

  private async processCleanupTask(data: any): Promise<void> {
    // Implementation for cleanup tasks
  }

  private async processBackupTask(data: any): Promise<void> {
    // Implementation for backup tasks
  }

  private async processMaintenanceTask(data: any): Promise<void> {
    // Implementation for maintenance tasks
  }
}
