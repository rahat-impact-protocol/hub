import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from 'prisma/prisma.service';
import { PROCESSOR, PROCESSOR_JOB } from 'src/common/constants/processor';

@Injectable()
export class ResponseService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(PROCESSOR.RESPONSE) private readonly responseQueue: Queue,
  ) {}

  async followResponse(data: any) {
    const { status, responsePayload, responseSender, responseReceiver,projectId,actionPerformed } = data;
    const serviceDetails = await this.prisma.service.findUnique({
      where: {
        id: responseReceiver,
      },
    });

    const url = `${serviceDetails?.baseUrl}/response`;

    const responseData = {
        method:'POST',
        url,
        status,
        responsePayload,
        responseSender,
        projectId,
        actionPerformed
    }

    const job = await this.responseQueue.add(PROCESSOR_JOB.RESPONSE, responseData);
    return {
      success: true,
      message: 'Request queued for processing',
      jobId: job.id,
    };
  }
}
