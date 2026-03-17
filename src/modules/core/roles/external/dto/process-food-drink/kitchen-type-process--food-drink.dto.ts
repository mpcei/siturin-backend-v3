import { IsUUID, IsOptional, IsString } from 'class-validator';

export class KitchenTypeDto {
  @IsUUID()
  @IsOptional()
  readonly id?: string;

  @IsString()
  @IsOptional()
  readonly code?: string;
}
