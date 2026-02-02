import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@utils/pagination';

export class FilterCadastreDto extends PaginationDto {
  @IsOptional()
  @IsString()
  readonly registerNumber: string;

  @IsOptional()
  @IsString()
  readonly systemOrigin: string;
}
