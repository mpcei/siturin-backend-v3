import { PickType } from '@nestjs/swagger';
import { UserDto } from '@auth/dto';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions, minLengthValidationOptions } from '@utils/dto-validation';

export class UpdateUserDto extends PickType(UserDto, [
  'email',
  'identification',
  'lastname',
  'name',
  'passwordChanged',
  'roles',
  'username',
]) {
  @IsOptional()
  @IsString(isStringValidationOptions())
  @MinLength(8, minLengthValidationOptions())
  @MaxLength(32, minLengthValidationOptions())
  readonly password: string;
}
