import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { httpClient } from '../common/http-client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService implements OnModuleInit {
  private readonly logger = new Logger(ServicesService.name);
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('ServicesService initialized - Cron job should be registered');
  }

  async create(createServiceDto: CreateServiceDto) {
    const { capabilities, ...serviceData } = createServiceDto;

    return this.prisma.service.create({
      data: {
        ...serviceData,
        status: 'OFFLINE',
        capabilities: capabilities
          ? {
              create: capabilities.map((cap) => ({
                name: cap.name,
                method: cap.method,
                path: cap.path,
                inputSchema: cap.inputSchema,
                outputSchema: cap.outputSchema,
                executionMode: cap.executionMode || 'SYNC',
                timeoutMs: cap.timeoutMs,
                retryable: cap.retryable !== undefined ? cap.retryable : true,
              })),
            }
          : undefined,
      },
      include: {
        capabilities: true,
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany();
  }

  async getCapabilities(serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        capabilities: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    return service.capabilities;
  }

  @Cron('*/5 * * * *')
  async checkHealth() {
    this.logger.log('Health check cron job starteds');
    try {
      const services = await this.prisma.service.findMany();
      this.logger.log(`Checking health for ${services.length} services`);
    const results: Array<{
      name: string;
    }> = [];

    for (const service of services) {
      try {
        const healthUrl = `${service.baseUrl}/registry/health`;
        let isHealthy = false;

        try {
          const response = await httpClient.get(healthUrl, {
            timeout: 5000,
            headers: {
              'Accept': 'application/json',
            },
          });

          if (response.status >= 200 && response.status < 300) {
            isHealthy = true;
          }
        } catch (error) {
          isHealthy = false;
        }

        const now = new Date();
        await this.prisma.service.update({
          where: { id: service.id },
          data: {
            status: isHealthy ? 'ONLINE' : 'OFFLINE',
            lastHeartbeat: isHealthy ? now : service.lastHeartbeat,
          },
        });

        results.push({
          name: service.id,
        });
      } catch (error) {
        // If health check fails completely, mark as offline
        await this.prisma.service.update({
          where: { id: service.id },
          data: {
            status: 'OFFLINE',
            lastHeartbeat: service.lastHeartbeat, // Don't update heartbeat if check failed
          },
        });

        results.push({
          name: service.id,
        });
      }
    }

      return {
        checkedAt: new Date(),
        totalServices: services.length,
        results,
      };
    } catch (error) {
      this.logger.error(`Error in health check cron job: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      throw error;
    }
  }

}
