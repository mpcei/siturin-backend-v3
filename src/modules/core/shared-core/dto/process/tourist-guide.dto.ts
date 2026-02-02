import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { TouristLicenseEntity } from '@modules/core/entities';

export class TouristGuideDto {
  @IsString(isStringValidationOptions())
  readonly identification: string;

  @IsString(isStringValidationOptions())
  readonly name: string;

  @IsBoolean(isBooleanValidationOptions())
  readonly isGuide: boolean;

  @IsOptional()
  @IsArray()
  readonly touristLicenses: TouristLicenseEntity[];
}
