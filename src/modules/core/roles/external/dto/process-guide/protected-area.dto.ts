import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class ProtectedAreaDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly province: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly canton: any;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly areaCode: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly areaName: string;
}
