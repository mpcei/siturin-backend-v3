import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { ProcessGuideEntity } from '@modules/core/entities/process-guide.entity';

export class DocumentReviewDto {
  @IsOptional()
  readonly processGuide: ProcessGuideEntity;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly processState: any;

  @IsString(isStringValidationOptions())
  readonly idProcess: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly observation: string;
}
