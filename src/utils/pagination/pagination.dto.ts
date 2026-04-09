import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import {
  isNotEmptyValidationOptions,
  isPositiveValidationOptions,
  isStringValidationOptions,
} from '../dto-validation';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @Type(() => Number)
  @IsPositive(isPositiveValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  limit: number;

  @Type(() => Number)
  @IsPositive(isPositiveValidationOptions())
  @IsNotEmpty(isNotEmptyValidationOptions())
  page: number;

  @IsString(isStringValidationOptions())
  @IsOptional()
  search: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',');
    if (Array.isArray(value)) return value.map(String);
    return [];
  })
  @IsOptional()
  relations?: string[];

  static getOffset(limit: number, page: number): number {
    page = page < 1 ? 1 : page - 1;
    return page * limit;
  }
}
