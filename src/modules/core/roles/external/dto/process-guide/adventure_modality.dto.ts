import { IsNotEmpty, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class AdventureModalityDto {
  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly modalityCode: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly modalityName: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly modalityCertificateCode: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly modalityCertificateName: string;
}
