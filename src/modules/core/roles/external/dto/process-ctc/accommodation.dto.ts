import { IsOptional, IsPositive } from 'class-validator';
import { isPositiveValidationOptions } from '@utils/dto-validation';

export class AccommodationDto {
  @IsOptional()
  @IsPositive(isPositiveValidationOptions())
  readonly totalBeds: number;

  @IsOptional()
  @IsPositive(isPositiveValidationOptions())
  readonly totalPlaces: number;

  @IsOptional()
  @IsPositive(isPositiveValidationOptions())
  readonly totalRooms: number;
}
