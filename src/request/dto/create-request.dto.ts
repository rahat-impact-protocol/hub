import { IsString, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  version: string;

  @IsString()
  serviceId: string;

  @IsString()
  capability: string;

  @IsString()
  senderId: string;

  @IsString()
  message: string; // Encrypted payload as string

  @IsString()
  @IsOptional()
  callbackUrl: string;

  @IsString()
  @IsOptional()
  projectId: string;

  @IsString()
  @IsOptional()
  payment: string;
}
