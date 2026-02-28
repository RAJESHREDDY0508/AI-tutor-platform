import { Module } from '@nestjs/common';
import { SqsClient } from './sqs.client';

@Module({
  providers: [SqsClient],
  exports: [SqsClient],
})
export class QueueModule {}
