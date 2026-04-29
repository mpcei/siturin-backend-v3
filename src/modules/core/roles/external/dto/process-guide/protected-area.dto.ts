import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class ProtectedAreaDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly province: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly canton: any;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly areaCode: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly areaName: string;
}
