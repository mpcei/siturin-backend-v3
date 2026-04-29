import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import {
  isDateValidationOptions,
  isNotEmptyValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';

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

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly driverLicense: string;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly professionalTitle: any;

  @IsOptional() //review
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly startedAt: Date;

  @IsOptional() //review
  @IsDate(isDateValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly endedAt: Date;
}
