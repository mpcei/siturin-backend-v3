import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { ProcessEntity, TouristLicenseEntity } from '@modules/core/entities';

export class BaseActivityDto {
  @IsOptional()
  readonly id: string;

  @IsOptional()
  readonly process: ProcessEntity;

  @IsString(isStringValidationOptions())
  readonly identification: string;

  @IsBoolean(isBooleanValidationOptions())
  readonly isGuide: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasTouristGuide: boolean;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly name: string;

  @IsOptional()
  readonly touristLicences: TouristLicenseEntity[];
}
