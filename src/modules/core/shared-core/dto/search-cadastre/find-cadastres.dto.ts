import { PickType } from '@nestjs/swagger';
import { PaginationDto } from '@utils/pagination';
import { IsOptional, IsString } from 'class-validator';
import { isStringValidationOptions } from '@utils/dto-validation';

export class FindCadastresDto extends PickType(PaginationDto, ['page', 'limit', 'search']) {
  @IsOptional()
  @IsString(isStringValidationOptions())
  ruc: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  tradeName: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  canton: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  activity: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  search: string;
}
