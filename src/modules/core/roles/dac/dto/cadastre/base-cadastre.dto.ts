import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  isDateValidationOptions,
  isNotEmptyValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';
import { ProcessEntity } from '@modules/core/entities';

export class BaseCadastreDto {
  @IsOptional()
  readonly process: ProcessEntity;

  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly idTemp: number;

  @IsString(isStringValidationOptions())
  readonly idProcess: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly observation: string;

  @IsString(isStringValidationOptions())
  readonly registerNumber: string;

  @IsDate(isDateValidationOptions())
  readonly registeredAt: Date;

  @IsString(isStringValidationOptions())
  readonly systemOrigin: string;
}
