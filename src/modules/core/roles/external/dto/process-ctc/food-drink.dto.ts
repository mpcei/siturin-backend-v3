import { IsOptional, IsPositive } from 'class-validator';
import { isPositiveValidationOptions } from '@utils/dto-validation';

export class FoodDrinkDto {
  @IsOptional()
  @IsPositive(isPositiveValidationOptions())
  readonly totalCapacities: number;

  @IsOptional()
  @IsPositive(isPositiveValidationOptions())
  readonly totalTables: number;
}
