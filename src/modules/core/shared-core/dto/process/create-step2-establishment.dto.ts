import { IsNumber, IsOptional, IsString } from 'class-validator';
import { isNumberValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class CreateStep2EstablishmentDto {
  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly webPage: string;

  @IsNumber({}, isNumberValidationOptions())
  readonly totalMen: number;

  @IsNumber({}, isNumberValidationOptions())
  readonly totalWomen: number;

  @IsNumber({}, isNumberValidationOptions())
  readonly totalMenDisability: number;

  @IsNumber({}, isNumberValidationOptions())
  readonly totalWomenDisability: number;
}
