import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { Type } from 'class-transformer';

export class CreateStep1Dto {
  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly processId: string;

  @IsOptional()
  @Type(() => CatalogueEntity)
  readonly type: CatalogueEntity;

  @IsOptional()
  @Type(() => CatalogueEntity)
  readonly legalEntity: CatalogueEntity;

  @IsOptional()
  @IsBoolean(isBooleanValidationOptions())
  readonly hasTouristActivityDocument: boolean;

  @IsOptional()
  @IsBoolean(isBooleanValidationOptions())
  readonly hasPersonDesignation: boolean;
}
