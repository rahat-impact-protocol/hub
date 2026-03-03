import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { HttpMethod, ExecutionMode } from '@prisma/client';

export class CreateCapabilityDto {
  @IsString()
  name: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsString()
  path: string;

  @IsOptional()
  inputSchema?: any;

  @IsOptional()
  outputSchema?: any;

  @IsOptional()
  @IsEnum(ExecutionMode)
  executionMode?: ExecutionMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutMs?: number;

  @IsOptional()
  @IsBoolean()
  retryable?: boolean;
}

export class CreateServiceDto {
  @IsString()
  id: string;

  @IsString()
  baseUrl: string;

  @IsString()
  publicKey: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCapabilityDto)
  capabilities?: CreateCapabilityDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceTags?: string[];
}

