import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':serviceId/capabilities')
  getCapabilities(@Param('serviceId') serviceId: string) {
    return this.servicesService.getCapabilities(serviceId);
  }

  @Post('health-check')
  checkHealth() {
    return this.servicesService.checkHealth();
  }
}
