import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InternalUserDto {
  // @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
