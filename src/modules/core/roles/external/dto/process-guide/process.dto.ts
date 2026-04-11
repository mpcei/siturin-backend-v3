import { IsDate, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { isDateValidationOptions, isNotEmptyValidationOptions } from '@utils/dto-validation';

export class ProcessDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly type: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly activity: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly classification: any;

  @IsOptional() //review
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly category: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly geographicArea: any;

  @IsOptional() //review
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly startedAt: Date;

  @IsOptional() //review
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly endedAt: Date;
}
