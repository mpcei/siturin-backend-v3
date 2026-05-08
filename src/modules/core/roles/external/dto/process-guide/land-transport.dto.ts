import { IsDate, IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import {
  isDateValidationOptions,
  isNotEmptyValidationOptions,
  isNumberValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';

export class LandTransportDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly type: any;

  // @IsString(isStringValidationOptions())
  // @IsNotEmpty(isNotEmptyValidationOptions())
  // readonly registration: string;

  // @IsDate(isDateValidationOptions())
  // @IsNotEmpty(isNotEmptyValidationOptions())
  // readonly registrationAt: Date;

  // @IsDate(isDateValidationOptions())
  // @IsNotEmpty(isNotEmptyValidationOptions())
  // readonly registrationExpirationAt: Date;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly plate: string;

  @IsNumber({}, isNumberValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly year: number;
}
