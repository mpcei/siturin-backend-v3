import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { ProcessGuideEntity } from '@modules/core/entities/process-guide.entity';
import { Type } from 'class-transformer';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

export class DocumentReviewDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessGuideEntity)
  readonly processGuides: ProcessGuideEntity[];

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly processState: CatalogueEntity;

  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly processId: string;

  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly assignmentId: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly observation: string;
}
