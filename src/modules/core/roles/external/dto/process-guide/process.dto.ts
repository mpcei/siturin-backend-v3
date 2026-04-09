import { IsDate, IsNotEmpty, IsObject } from 'class-validator';
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

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly category: any;

  @IsDate(isDateValidationOptions())
  readonly startedAt: Date;

  @IsDate(isDateValidationOptions())
  readonly endedAt: Date;
}
