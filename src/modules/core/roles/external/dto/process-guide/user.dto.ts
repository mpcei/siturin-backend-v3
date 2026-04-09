import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import {
  isBooleanValidationOptions,
  isNotEmptyValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';

export class UserDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly bloodType: any;

  @IsBoolean(isBooleanValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly hasDisability: boolean;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly phone: string;

  @IsString(isStringValidationOptions())
  @IsOptional()
  readonly secondaryPhone: string;

  @IsString(isStringValidationOptions())
  @IsOptional()
  readonly email: string;
}
