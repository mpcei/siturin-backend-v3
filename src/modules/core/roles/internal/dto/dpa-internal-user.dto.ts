import { IsNotEmpty, IsString } from 'class-validator';

export class DpaInternalUserDto {
  @IsString()
  @IsNotEmpty()
  internalUserId: string;

  @IsString()
  @IsNotEmpty()
  dpaId: string;
}
