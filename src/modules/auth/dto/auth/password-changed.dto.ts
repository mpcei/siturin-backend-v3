import { IsNotEmpty, IsString } from 'class-validator';
import { FieldLabel, isStringValidationOptions } from '@utils/dto-validation';

export class PasswordChangedDto {
  @FieldLabel('Contraseña')
  @IsNotEmpty()
  @IsString(isStringValidationOptions())
  password: string;

  @FieldLabel('Confirmación de Contraseña')
  @IsNotEmpty()
  @IsString(isStringValidationOptions())
  passwordConfirm: string;
}
