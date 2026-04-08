import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';
import { isDateValidationOptions, isNotEmptyValidationOptions } from '@utils/dto-validation';

export class ProcessDto {
  @IsUUID()
  @IsNotEmpty(isNotEmptyValidationOptions())
  readonly typeId: string;

  @IsDate(isDateValidationOptions())
  readonly startedAt: Date;

  @IsDate(isDateValidationOptions())
  readonly endedAt: Date;
}
