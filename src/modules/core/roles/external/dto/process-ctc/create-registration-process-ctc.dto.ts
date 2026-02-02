import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { isBooleanValidationOptions } from '@utils/dto-validation';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { ActivityEntity, CategoryEntity, ClassificationEntity } from '@modules/core/entities';
import { AccommodationDto } from '@modules/core/roles/external/dto/process-ctc/accommodation.dto';
import { FoodDrinkDto } from './food-drink.dto';
import { TouristTransportDto } from './tourist-transport.dto';
import { CommunityOperationDto } from '@modules/core/roles/external/dto/process-ctc/community-operation.dto';
import { RegulationDto } from '@modules/core/shared-core/dto/process/regulation.dto';

export class CreateRegistrationProcessCtcDto {
  @IsUUID()
  readonly processId: string;

  @IsObject()
  @Type(() => CatalogueDto)
  readonly type: CatalogueDto;

  @IsObject()
  @Type(() => CatalogueDto)
  readonly activities: CatalogueDto[];

  @IsObject()
  @Type(() => ActivityEntity)
  readonly activity: ActivityEntity;

  @IsOptional()
  @IsObject()
  @Type(() => CatalogueDto)
  readonly geographicArea: CatalogueDto;

  @IsObject()
  @Type(() => ClassificationEntity)
  readonly classification: ClassificationEntity;

  @IsObject()
  @Type(() => CategoryEntity)
  readonly category: CategoryEntity;

  @IsOptional()
  @IsBoolean(isBooleanValidationOptions())
  readonly hasPropertyRegistrationCertificate: boolean;

  @IsOptional()
  @IsBoolean(isBooleanValidationOptions())
  readonly hasTechnicalReport: boolean;

  @IsOptional()
  @IsBoolean(isBooleanValidationOptions())
  readonly hasStatute: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AccommodationDto)
  readonly accommodation: AccommodationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FoodDrinkDto)
  readonly foodDrink: FoodDrinkDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TouristTransportDto)
  readonly touristTransport: TouristTransportDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CommunityOperationDto)
  readonly communityOperation: CommunityOperationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RegulationDto)
  readonly regulation: RegulationDto;
}
