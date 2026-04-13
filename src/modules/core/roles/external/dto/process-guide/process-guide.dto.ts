import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { Type } from 'class-transformer';

export class ProcessGuideDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly requirement: any;

  @Type(() => String)
  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly value: string;
}
