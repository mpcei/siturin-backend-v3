import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import {
  isDateValidationOptions,
  isNotEmptyValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';
import { Type } from 'class-transformer';

export class ProcessDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly type: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly activity: any;

  @IsOptional()
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly classification: any;

  @IsOptional() //review
  @IsObject()
  // @IsNotEmpty(isNotEmptyValidationOptions())
  readonly category: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly geographicArea: any;

  @IsOptional()
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly driverLicense: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly professionalTitle: any;

  @Type(() => Date)
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly startedAt: Date;

  @Type(() => Date)
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly endedAt: Date;
}
