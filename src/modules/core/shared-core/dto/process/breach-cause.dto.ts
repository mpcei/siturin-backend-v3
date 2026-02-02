import { IsString } from 'class-validator';
import { isStringValidationOptions } from '@utils/dto-validation';

export class BreachCauseDto {
  @IsString(isStringValidationOptions())
  readonly code: string;

  @IsString(isStringValidationOptions())
  readonly name: string;
}
