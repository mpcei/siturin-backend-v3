import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import {
  isNotEmptyValidationOptions,
  isPositiveValidationOptions,
  isStringValidationOptions,
} from '../dto-validation';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @IsNotEmpty(isNotEmptyValidationOptions())
  @IsPositive(isPositiveValidationOptions())
  limit: number;

  @IsNotEmpty(isNotEmptyValidationOptions())
  @IsPositive(isPositiveValidationOptions())
  page: number;

  @IsOptional()
  @IsString(isStringValidationOptions())
  search: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',');
    if (Array.isArray(value)) return value.map(String);
    return [];
  })
  relations?: string[];

  static getOffset(limit: number, page: number): number {
    page = page < 1 ? 1 : page - 1;
    return page * limit;
  }
}
