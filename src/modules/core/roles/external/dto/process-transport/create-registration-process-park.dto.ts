import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { ActivityEntity, CategoryEntity, ClassificationEntity } from '@modules/core/entities';
import { isBooleanValidationOptions } from '@utils/dto-validation';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { RegulationDto } from '@modules/core/shared-core/dto/process/regulation.dto';

export class CreateRegistrationProcessParkDto {
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

  @IsBoolean(isBooleanValidationOptions())
  readonly isProtectedArea: boolean;

  @IsBoolean(isBooleanValidationOptions())
  readonly hasProtectedAreaContract: boolean;

  @IsNumber()
  readonly totalCapacities: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RegulationDto)
  readonly regulation: RegulationDto;
}
