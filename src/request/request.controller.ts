import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post('')
  createRequest(@Body() createRequestDto: CreateRequestDto) {
    return this.requestService.createRequest(createRequestDto);
  }

  @Get('')
  forwardGetRequest(@Query() query: any) {
    return this.requestService.forwardGetRequest(query);
  }
}
