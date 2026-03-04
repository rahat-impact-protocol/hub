import { Module } from '@nestjs/common';
import { ResponseService } from './response.service';
import { ResponseController } from './response.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { PROCESSOR } from 'src/common/constants/processor';

@Module({
imports:[
    PrismaModule,
    BullModule.registerQueue({
        name: PROCESSOR.RESPONSE
    })
],
controllers:[ResponseController],
providers:[ResponseService]

})
export class ResponseModule {}
