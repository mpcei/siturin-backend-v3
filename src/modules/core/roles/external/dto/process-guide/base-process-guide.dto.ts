import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  EstablishmentDto,
  ProcessDto,
  UserDto,
} from '@modules/core/roles/external/dto/process-guide';

export class BaseProcessGuideDto {
  @IsObject()
  @ValidateNested()
  @Type(() => EstablishmentDto)
  readonly establishment: EstablishmentDto;

  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  readonly user: UserDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ProcessDto)
  readonly process: ProcessDto;
}
