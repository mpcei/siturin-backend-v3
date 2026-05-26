import { IsDate, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { isDateValidationOptions, isNotEmptyValidationOptions } from '@utils/dto-validation';
import { Type } from 'class-transformer';

export class CurrentProcessDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly type: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly activity: any;

  @Type(() => Date)
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly startedAt: Date;

  @Type(() => Date)
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly endedAt: Date;

  @IsOptional()
  @IsObject()
  readonly professionalTitle: any;
}
