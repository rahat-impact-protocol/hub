import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RequestProcessor } from './request.processor';
import { PROCESSOR } from '../common/constants/processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PROCESSOR.REQUEST,
    }),
  ],
  providers: [RequestProcessor],
  exports: [RequestProcessor],
})
export class ProcessorModule {}
