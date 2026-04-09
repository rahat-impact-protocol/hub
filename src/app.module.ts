import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { PrismaModule } from 'prisma/prisma.module';
import { RequestModule } from './request/request.module';
import { ProcessorModule } from './processor/processor.module';
import { ResponseModule } from './response/response.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ,
        port: parseInt(process.env.REDIS_PORT  || ''),
        password:process.env.REDIS_PASSWORD || ''
      },
    }),
    ServicesModule,
    PrismaModule,
    RequestModule,
    ProcessorModule,
    ResponseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
