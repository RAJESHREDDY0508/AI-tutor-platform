import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export interface QueueMessage<T = Record<string, unknown>> {
  readonly eventType: string;
  readonly payload: T;
  readonly timestamp: string;
  readonly traceId?: string;
}

/**
 * SQS queue client wrapper.
 * Used to push async tasks (email notifications, homework grading, analytics events).
 *
 * Sprint 1: Scaffold with local mock — real SQS calls require AWS credentials.
 * Sprint 15+: Enable real SQS with DLQ and visibility timeout configuration.
 */
@Injectable()
export class SqsClient {
  private readonly logger = new Logger(SqsClient.name);
  private readonly sqsClient: SQSClient;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = configService.get<string>('NODE_ENV') === 'production';

    this.sqsClient = new SQSClient({
      region: configService.get<string>('AWS_REGION', 'us-east-1'),
      ...(configService.get<string>('AWS_ACCESS_KEY_ID') && {
        credentials: {
          accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
        },
      }),
    });
  }

  async sendMessage<T>(queueUrl: string, message: QueueMessage<T>): Promise<void> {
    const body = JSON.stringify(message);

    if (!this.isEnabled) {
      this.logger.debug({ queueUrl, eventType: message.eventType }, '[SQS MOCK] Message queued');
      return;
    }

    try {
      await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: body,
          MessageAttributes: {
            eventType: {
              DataType: 'String',
              StringValue: message.eventType,
            },
          },
        }),
      );

      this.logger.log({ queueUrl, eventType: message.eventType }, 'SQS message sent');
    } catch (error) {
      this.logger.error({ error, queueUrl, eventType: message.eventType }, 'Failed to send SQS message');
      throw error;
    }
  }

  async sendEmailNotification(payload: {
    to: string;
    subject: string;
    templateId: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    const queueUrl = this.configService.get<string>('SQS_EMAIL_QUEUE_URL');
    if (!queueUrl) {
      this.logger.warn('SQS_EMAIL_QUEUE_URL not configured — email notification skipped');
      return;
    }

    await this.sendMessage(queueUrl, {
      eventType: 'email.send',
      payload,
      timestamp: new Date().toISOString(),
    });
  }
}
