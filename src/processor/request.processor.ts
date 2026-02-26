import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { httpClient } from '../common/http-client';
import { HttpMethod } from '@prisma/client';
import { PROCESSOR, PROCESSOR_JOB } from '../common/constants/processor';

interface RequestJobData {
  url: string;
  method: HttpMethod;
  message: string; // Encrypted payload as string
}

@Injectable()
@Processor(PROCESSOR.REQUEST)
export class RequestProcessor extends WorkerHost {
  constructor() {
    super();
  }

  async process(
    job: Job<RequestJobData, any, string>,
  ): Promise<any> {
    switch (job.name) {
      case PROCESSOR_JOB.REQUEST: {
        const data = job.data as RequestJobData;
        return this.processRequest(data);
      }
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async processRequest(data: RequestJobData) {
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
        message: `Request failed: ${data.url}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<RequestJobData>) {
    console.log({
      message: `Processing request job ${job.id} (type: ${job.name})`,
    });
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<RequestJobData>, result: any) {
    console.log({
      message: `Completed request job ${job.id}: ${result.success ? 'SUCCESS' : 'FAILED'}`,
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<RequestJobData>, error: Error) {
    console.error({
      message: `Request job ${job.id} failed: ${error.message}`,
      error,
    });
  }
}

