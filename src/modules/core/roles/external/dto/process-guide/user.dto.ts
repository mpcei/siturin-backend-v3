import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  isBooleanValidationOptions,
  isNotEmptyValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';

export class UserDto {
  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly bloodTypeId: string;

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
