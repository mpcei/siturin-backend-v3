import { IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  EstablishmentDto,
  ProcessDto,
  ProcessGuideDto,
  UserDto,
} from '@modules/core/roles/external/dto/process-guide';
import { WithOriginProcessDto } from '@modules/core/roles/external/dto/process-guide/with-origin-process.dto';
import { CredentialSieteDto } from '@modules/core/roles/external/dto/process-guide/credential-siete.dto';
import { GuideOriginDto } from '@modules/core/roles/external/dto/process-guide/guide-origin.dto';

export class BaseWithOriginProcessGuideDto {
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
  @Type(() => WithOriginProcessDto)
  //readonly process: WithOriginProcessDto;
  readonly process: ProcessDto;

  @IsObject()
  @ValidateNested()
  @Type(() => GuideOriginDto)
  readonly guideOrigin: GuideOriginDto;

  @IsArray()
  @ValidateNested()
  @Type(() => ProcessGuideDto)
  readonly processGuides: ProcessGuideDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CredentialSieteDto)
  readonly credentials: CredentialSieteDto[];
}
