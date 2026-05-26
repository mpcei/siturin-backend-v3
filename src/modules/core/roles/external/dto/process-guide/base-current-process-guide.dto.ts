import { IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  EstablishmentDto,
  ProcessGuideDto,
  UserDto,
} from '@modules/core/roles/external/dto/process-guide';
import { CurrentProcessDto } from '@modules/core/roles/external/dto/process-guide/current-process.dto';
import { CredentialDto } from '@modules/core/roles/external/dto/process-guide/credential.dto';

export class BaseCurrentProcessGuideDto {
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
  @Type(() => CurrentProcessDto)
  readonly currentProcess: CurrentProcessDto;

  @IsArray()
  @ValidateNested()
  @Type(() => ProcessGuideDto)
  readonly processGuides: ProcessGuideDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CredentialDto)
  readonly credentials: CredentialDto[];
}
