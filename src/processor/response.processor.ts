import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { httpClient } from '../common/http-client';
import { HttpMethod } from '@prisma/client';
import { PROCESSOR, PROCESSOR_JOB } from '../common/constants/processor';

interface ResponseJobData {
  url: string;
  method: HttpMethod;
  message: string; // Encrypted payload as string
}

@Injectable()
@Processor(PROCESSOR.RESPONSE)
export class ResponseProcessor extends WorkerHost {
  constructor() {
    super();
  }

  async process(
    job: Job<ResponseJobData, any, string>,
  ): Promise<any> {
    switch (job.name) {
      case PROCESSOR_JOB.RESPONSE: {
        const data = job.data as ResponseJobData;
        return this.processResponse(data);
      }
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async processResponse(data: ResponseJobData) {
    try {
      const response = await httpClient.request({
        url: data.url,
        method: data.method,
        data: data ,
      });

      return {
        success: true,
        data: {payload: response.data},
        status: response.status,
      };
    } catch (error) {
      console.error({
        message: `Response failed: ${data.url}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<ResponseJobData>) {
    console.log({
      message: `Processing Response job ${job.id} (type: ${job.name})`,
    });
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<ResponseJobData>, result: any) {
    console.log({
      message: `Completed Response job ${job.id}: ${result.success ? 'SUCCESS' : 'FAILED'}`,
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ResponseJobData>, error: Error) {
    console.error({
      message: `Response job ${job.id} failed: ${error.message}`,
      error,
    });
  }
}

