import { IsBoolean, IsUUID, IsString } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class BaseSalesRepresentativeDto {
  @IsUUID()
  readonly processId: string;

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
