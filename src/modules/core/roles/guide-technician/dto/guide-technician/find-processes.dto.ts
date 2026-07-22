import { PickType } from '@nestjs/swagger';
import { PaginationDto } from '@utils/pagination';
import { IsString } from 'class-validator';
import { isStringValidationOptions } from '@utils/dto-validation';

export class FindProcessesDto extends PickType(PaginationDto, ['page', 'limit', 'search']) {
  @IsString(isStringValidationOptions())
  rolCode: string;

  @IsString(isStringValidationOptions())
  isCurrent: boolean;
}
