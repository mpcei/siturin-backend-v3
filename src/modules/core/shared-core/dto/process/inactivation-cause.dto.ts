import { IsString } from 'class-validator';
import { isStringValidationOptions } from '@utils/dto-validation';

export class InactivationCauseDto {
  @IsString(isStringValidationOptions())
  readonly code: string;

  @IsString(isStringValidationOptions())
  readonly name: string;
}
