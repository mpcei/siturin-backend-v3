import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { isBooleanValidationOptions } from '@utils/dto-validation';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { RegulationDto } from '@modules/core/shared-core/dto/process/regulation.dto';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { ActivityEntity, CategoryEntity, ClassificationEntity } from '@modules/core/entities';
import { KitchenTypeDto } from './kitchen-type-process--food-drink.dto';
import { ServiceTypeDto } from './service-type-process--food-drink.dto';

export class CreateRegistrationProcessFoodDrinkDto {
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
  @IsObject()
  @Type(() => CatalogueDto)
  readonly localType: CatalogueDto;

  @IsOptional()
  @IsObject()
  @Type(() => CatalogueDto)
  readonly geographicArea: CatalogueDto;

  @IsObject()
  @Type(() => CatalogueDto)
  readonly establishmentType: CatalogueDto;

  @IsOptional()
  @IsString()
  readonly establishmentName: string;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasFranchiseGrantCertificate: boolean;

  @IsNumber()
  readonly totalTables: number;

  @IsNumber()
  readonly totalCapacities: number;

  @IsArray()
  @ValidateNested()
  @Type(() => KitchenTypeDto)
  readonly kitchenTypes: KitchenTypeDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => ServiceTypeDto)
  readonly serviceTypes: ServiceTypeDto[];

  @IsBoolean(isBooleanValidationOptions())
  readonly hasLandUse: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RegulationDto)
  readonly regulation: RegulationDto;
}
