import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
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
import { LandTransportDto } from '@modules/core/roles/external/dto/process-guide/land-transport.dto';
import { CredentialDto } from '@modules/core/roles/external/dto/process-guide/credential.dto';
import { CatalogueProcessesTypeEnum } from '@modules/core/utils/enums';
import { isNotEmptyValidationOptions } from '@utils/dto-validation';

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

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => LandTransportDto)
  readonly landTransports: LandTransportDto[];

  @ValidateIf(
    (o: BaseProcessGuideDto) =>
      o.process?.type?.code === CatalogueProcessesTypeEnum.readmission ||
      o.process?.type?.code === CatalogueProcessesTypeEnum.renewal_classification_update,
  )
  @IsNotEmpty(isNotEmptyValidationOptions())
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CredentialDto)
  readonly credentials: CredentialDto[];
}
