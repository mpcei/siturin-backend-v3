import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { isNotEmptyValidationOptions, isStringValidationOptions } from '@utils/dto-validation';

export class ProcessGuideDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly requirement: any;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly value: string;
}
