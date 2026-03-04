import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RequestProcessor } from './request.processor';
import { PROCESSOR } from '../common/constants/processor';
import { ResponseProcessor } from './response.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PROCESSOR.REQUEST,
    }),
     BullModule.registerQueue({
      name: PROCESSOR.RESPONSE,
    }),
  ],
  providers: [RequestProcessor,ResponseProcessor],
  exports: [RequestProcessor,ResponseProcessor],
})
export class ProcessorModule {}
