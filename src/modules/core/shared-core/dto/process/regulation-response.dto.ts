import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class RegulationResponseDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  isCompliant: boolean;

  @IsOptional()
  @IsNumber()
  score: number;
}
