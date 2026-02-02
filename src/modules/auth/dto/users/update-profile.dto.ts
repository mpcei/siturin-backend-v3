import { PickType } from '@nestjs/swagger';
import { UserDto } from '@auth/dto';

export class UpdateProfileDto extends PickType(UserDto, [
  'avatar',
  'identificationType',
  'birthdate',
  'identification',
  'lastname',
  'name',
  'email',
  'personalEmail',
  'cellPhone',
  'phone',
  'username',
]) {}
