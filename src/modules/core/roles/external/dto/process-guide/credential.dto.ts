import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class CredentialDto {
  @IsString()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly establishmentId: string;

  @IsString()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly classificationId: string;

  @IsString()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly categoryId: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly startedAt: Date;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly endedAt: Date;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly code: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly origin: string;

  @IsString()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly geographicAreaId: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly stateCode: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly stateName: string;
}
