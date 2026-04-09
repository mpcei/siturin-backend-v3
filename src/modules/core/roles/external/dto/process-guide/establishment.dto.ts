import { IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';
import {
  isNotEmptyValidationOptions,
  isNumberValidationOptions,
  isStringValidationOptions,
} from '@utils/dto-validation';
import { Type } from 'class-transformer';

export class EstablishmentDto {
  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly id: string;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly province: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly canton: any;

  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly parish: any;

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
