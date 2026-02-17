import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PROCESSOR } from '../common/constants/processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: PROCESSOR.REQUEST,
    }),
  ],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {}

