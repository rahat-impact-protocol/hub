import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ExecutionMode, HttpMethod } from '@prisma/client';
import { PROCESSOR, PROCESSOR_JOB } from '../common/constants/processor';
import { httpClient } from '../common/http-client';
import Ajv from 'ajv';

interface ValidatedEndpoint {
  url: string;
  method: HttpMethod;
  executionMode: ExecutionMode;
}

@Injectable()
export class RequestService {
  private readonly ajv = new Ajv();

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(PROCESSOR.REQUEST) private readonly requestQueue: Queue,
  ) {}

  async createRequest(createRequestDto: CreateRequestDto) {
    const { serviceId, capability, message, senderId, payment, callbackUrl } =
      createRequestDto;

    const validatedEndpoint = await this.getValidatedEndpoint(
      { serviceId, capability },
      message,
    );

    const data = {
      message,
      serviceId,
      senderId,
      projectId: createRequestDto?.projectId,
    };

    if (validatedEndpoint.executionMode === 'SYNC') {
      if (payment !== undefined) {
        return this.makeRequest(validatedEndpoint, data, payment);
      }
      return this.makeRequest(validatedEndpoint, data);
    }

    const jobData: {
      url: string;
      method: HttpMethod;
      payment?: string;
      payload: {
        message: string;
        serviceId: string;
        senderId: string;
        callbackUrl: string;
        projectId?: string;
      };
    } = {
      url: validatedEndpoint.url,
      method: validatedEndpoint.method,
      payload: {
        message,
        serviceId,
        senderId,
        callbackUrl,
        projectId: createRequestDto?.projectId,
      },
    };

    if (payment !== undefined) {
      jobData.payment = payment;
    }
    const job = await this.requestQueue.add(PROCESSOR_JOB.REQUEST, jobData);
    return {
      success: true,
      message: 'Request queued for processing',
      jobId: job.id,
    };
  }

  private async makeRequest(
    endpoint: ValidatedEndpoint,
    payload: any,
    payment?: string,
  ) {
    const data: { payload: string; payment?: string } = { payload };
    if (payment !== undefined) {
      data.payment = payment;
    }

    const response = await httpClient.request({
      url: endpoint.url,
      method: endpoint.method,
      data: data,
    });

    return response.data;
  }

  private async getValidatedEndpoint(
    target: { serviceId: string; capability: string },
    payload: string, // Encrypted payload as string
  ): Promise<ValidatedEndpoint> {
    // Find the capability
    const capability = await this.prisma.capability.findFirst({
      where: {
        serviceId: target.serviceId,
        name: target.capability,
      },
      include: {
        service: true,
      },
    });

    if (!capability) {
      throw new NotFoundException(
        `Capability "${target.capability}" not found for service "${target.serviceId}"`,
      );
    }

    // Check if service is online
    if (capability.service.status !== 'ONLINE') {
      throw new BadRequestException(
        `Service "${target.serviceId}" is currently OFFLINE`,
      );
    }

    return {
      url: `${capability.service.baseUrl}/${capability.path}`,
      method: capability.method,
      executionMode: capability.executionMode,
    };
  }
}
