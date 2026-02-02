import { IsOptional, IsString } from 'class-validator';
import { isStringValidationOptions } from '@utils/dto-validation';

export class CreateStep2EstablishmentContactPersonDto {
  @IsString(isStringValidationOptions())
  readonly identification: string;

  @IsString(isStringValidationOptions())
  readonly email: string;

  @IsString(isStringValidationOptions())
  readonly name: string;

  @IsString(isStringValidationOptions())
  readonly phone: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly secondaryPhone: string;
}
