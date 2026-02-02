import { IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateStep2EstablishmentAddressDto,
  CreateStep2EstablishmentContactPersonDto,
  CreateStep2EstablishmentDto,
} from '@modules/core/shared-core/dto/process';

export class AssignmentDto {
  @IsUUID()
  readonly processId: string;

  @ValidateNested()
  @Type(() => CreateStep2EstablishmentDto)
  readonly establishment: CreateStep2EstablishmentDto;

  @ValidateNested()
  @Type(() => CreateStep2EstablishmentAddressDto)
  readonly establishmentAddress: CreateStep2EstablishmentAddressDto;

  @ValidateNested()
  @Type(() => CreateStep2EstablishmentContactPersonDto)
  readonly establishmentContactPerson: CreateStep2EstablishmentContactPersonDto;
}
