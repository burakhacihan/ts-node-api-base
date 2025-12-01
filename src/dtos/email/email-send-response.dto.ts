export class EmailSendResponseDto {
  id: string;
  success: boolean;
  provider: string;
  messageId?: string;
  timestamp: Date;
  retryCount?: number;

  static fromEmailResult(result: any): EmailSendResponseDto {
    return {
      id: result.emailId,
      success: result.success,
      provider: result.provider,
      messageId: result.messageId,
      timestamp: result.timestamp,
      retryCount: result.retryCount,
    };
  }
}
