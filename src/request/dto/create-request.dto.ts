import { IsString, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  serviceId: string;

  @IsString()
  capability: string;

  @IsString()
  payload: string; // Encrypted payload as string

  @IsString()
  @IsOptional()
  payment: string;
}
