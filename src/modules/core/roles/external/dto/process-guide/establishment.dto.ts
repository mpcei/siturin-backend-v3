import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import {
  isNotEmptyValidationOptions,
  isNumberValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';

export class EstablishmentDto {
  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly id: string;

  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly provinceId: string;

  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly cantonId: string;

  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly parishId: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly mainStreet: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly numberStreet: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly secondaryStreet: string;

  @IsString(isStringValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly referenceStreet: string;

  @IsNumber({}, isNumberValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly latitude: number;

  @IsNumber({}, isNumberValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly longitude: number;
}
