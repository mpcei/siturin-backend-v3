import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { isDateValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class InspectionDto {
  @IsUUID()
  readonly processId: string;

  @IsDate(isDateValidationOptions())
  readonly inspectionAt: Date;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly state: string;
}
