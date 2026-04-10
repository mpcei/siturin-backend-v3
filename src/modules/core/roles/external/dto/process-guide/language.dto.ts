import { IsNotEmpty, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class LanguageDto {
  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly languageCode: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly languageName: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly languageLevelCode: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly languageLevelName: string;
}
