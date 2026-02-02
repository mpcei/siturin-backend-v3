import { IsNumber, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { isNumberValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { DpaEntity } from '@modules/common/dpa/dpa.entity';

export class CreateStep2EstablishmentAddressDto {
  @IsObject()
  @Type(() => DpaEntity)
  readonly province: DpaEntity;

  @IsObject()
  @Type(() => DpaEntity)
  readonly canton: DpaEntity;

  @IsObject()
  @Type(() => DpaEntity)
  readonly parish: DpaEntity;

  @IsString(isStringValidationOptions())
  readonly mainStreet: string;

  @IsString(isStringValidationOptions())
  readonly numberStreet: string;

  @IsString(isStringValidationOptions())
  readonly secondaryStreet: string;

  @IsString(isStringValidationOptions())
  readonly referenceStreet: string;

  @IsNumber({}, isNumberValidationOptions())
  readonly latitude: number;

  @IsNumber({}, isNumberValidationOptions())
  readonly longitude: number;
}
