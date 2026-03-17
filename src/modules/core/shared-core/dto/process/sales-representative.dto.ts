import { IsBoolean, IsString } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class SalesRepresentativeDto {
  @IsString(isStringValidationOptions())
  readonly ruc: string;

  @IsString(isStringValidationOptions())
  readonly legalName: string;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasProfessionalDegree: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasContract: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasWorkExperience: boolean;
}
