import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import {
  isNotEmptyValidationOptions,
  isNumberValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';

export class LandTransportDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly type: any;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly plate: string;

  @IsNumber({}, isNumberValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly year: number;
}
