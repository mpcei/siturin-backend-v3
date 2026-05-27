import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class GuideOriginDto {
  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly province: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly canton: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly languages: string;
}
