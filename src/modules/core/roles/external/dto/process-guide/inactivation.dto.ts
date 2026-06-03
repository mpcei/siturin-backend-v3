import { IsArray, IsNotEmpty, IsObject, IsUUID, ValidateNested } from 'class-validator';
import { isNotEmptyValidationOptions } from '@utils/dto-validation';
import { Type } from 'class-transformer';
import { InactivationCauseDto } from '@modules/core/roles/external/dto/process-guide/inactivation-cause.dto';

export class InactivationDto {
  @IsObject()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly processType: any;

  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly establishmentId: string;

  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly cadastreId: string;

  @IsArray()
  @ValidateNested()
  @Type(() => InactivationCauseDto)
  readonly inactivationCauses: InactivationCauseDto[];
}
