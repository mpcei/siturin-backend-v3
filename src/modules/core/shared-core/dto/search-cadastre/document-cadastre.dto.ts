import { IsNotEmpty, IsNumber } from 'class-validator';
import { isNotEmptyValidationOptions, isNumberValidationOptions } from '@utils/dto-validation';

export class DocumentCadastreDto {
  @IsNumber({}, isNumberValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly year: number;

  @IsNumber({}, isNumberValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly month: number;

  @IsNumber({}, isNumberValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly period: number;
}
