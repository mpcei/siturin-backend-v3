import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  isBooleanValidationOptions,
  isNotEmptyValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';

export class LanguageDto {
  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly languageCode: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly languageName: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly levelCode: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly levelName: string;

  @IsBoolean(isBooleanValidationOptions())
  @IsOptional()
  readonly motherLanguage: boolean;
}
