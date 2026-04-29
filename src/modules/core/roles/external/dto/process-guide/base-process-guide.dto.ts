import { IsArray, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  AdventureModalityDto,
  EstablishmentDto,
  LanguageDto,
  ProcessDto,
  ProcessGuideDto,
  ProtectedAreaDto,
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

  @IsArray()
  @ValidateNested()
  @Type(() => ProcessGuideDto)
  readonly processGuides: ProcessGuideDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProtectedAreaDto)
  readonly protectedAreas: ProtectedAreaDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageDto)
  readonly languages: LanguageDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdventureModalityDto)
  readonly adventureModalities: AdventureModalityDto[];

  //LandTransportDto
}
