import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { isBooleanValidationOptions, isPositiveValidationOptions } from '@utils/dto-validation';
import { Type } from 'class-transformer';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { ActivityEntity, CategoryEntity, ClassificationEntity } from '@modules/core/entities';
import { TouristGuideDto } from '@modules/core/shared-core/dto/process';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { RegulationDto } from '@modules/core/shared-core/dto/process/regulation.dto';
import { AdventureTourismModalityDto } from '@modules/core/shared-core/dto/process/adventure-tourism-modality.dto';
import { SalesRepresentativeDto } from '@modules/core/shared-core/dto/process/sales-representative.dto';
import { TouristTransportCompanyDto } from '@modules/core/shared-core/dto/process/tourist-transport-company.dto';

export class CreateRegistrationProcessAgencyDto {
  @IsUUID()
  readonly processId: string;

  @IsObject()
  @Type(() => CatalogueEntity)
  readonly type: CatalogueEntity;

  @IsObject()
  @Type(() => ActivityEntity)
  readonly activity: ActivityEntity;

  @IsObject()
  @Type(() => ClassificationEntity)
  readonly classification: ClassificationEntity;

  @IsObject()
  @Type(() => CategoryEntity)
  readonly category: CategoryEntity;

  @IsOptional()
  @IsBoolean(isBooleanValidationOptions())
  readonly hasLandUse: boolean;

  @IsOptional()
  @IsObject()
  @Type(() => CatalogueDto)
  readonly localType: CatalogueDto;

  @IsObject()
  @Type(() => CatalogueDto)
  readonly permanentPhysicalSpace: CatalogueDto;

  @IsPositive(isPositiveValidationOptions())
  readonly totalAccreditedStaffLanguage: number;

  @IsPositive(isPositiveValidationOptions())
  readonly percentageAccreditedStaffLanguage: number;

  @IsBoolean(isBooleanValidationOptions())
  readonly isProtectedArea: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasProtectedAreaContract: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasTouristGuide: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasAdventureTourismModality: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasSalesRepresentative: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasTouristTransportCompany: boolean;

  @IsOptional()
  @IsObject()
  @Type(() => CatalogueDto)
  readonly geographicArea: CatalogueDto;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => TouristGuideDto)
  readonly touristGuides: TouristGuideDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => SalesRepresentativeDto)
  readonly salesRepresentatives: SalesRepresentativeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => TouristTransportCompanyDto)
  readonly touristTransportCompanies: TouristTransportCompanyDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => AdventureTourismModalityDto)
  readonly adventureTourismModalities: AdventureTourismModalityDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RegulationDto)
  readonly regulation: RegulationDto;
}
