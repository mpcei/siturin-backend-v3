import { PickType } from '@nestjs/swagger';
import { PaginationDto } from '@utils/pagination';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { Transform, Type } from 'class-transformer';

export class FindProcessesDto extends PickType(PaginationDto, ['page', 'limit', 'search']) {
  @IsString(isStringValidationOptions())
  rolCode: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean(isBooleanValidationOptions())
  isCurrent: boolean;

  @IsOptional()
  @IsString(isStringValidationOptions())
  registerNumber: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  establishmentNumber: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  legalName: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  province: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  canton: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  parish: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  classification: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  processType: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  cadastreState: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  startedAt: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  endedAt: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  search: string;
}
