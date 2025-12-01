export class EmailQueueResponseDto {
  jobId: string;
  status: string;
  queuedAt: Date;

  static fromJobId(jobId: string): EmailQueueResponseDto {
    return {
      jobId,
      status: 'queued',
      queuedAt: new Date(),
    };
  }
}
