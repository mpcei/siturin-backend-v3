import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { ProcessGuideEntity } from '@modules/core/entities/process-guide.entity';
import { Type } from 'class-transformer';

export class DocumentReviewDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessGuideEntity)
  readonly processGuides: ProcessGuideEntity[];

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly processState: any;

  @IsString(isStringValidationOptions())
  readonly idProcess: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly observation: string;
}
