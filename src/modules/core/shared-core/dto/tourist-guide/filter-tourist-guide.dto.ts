import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@utils/pagination';

export class FilterTouristGuideDto extends PaginationDto {
  @IsOptional()
  @IsString()
  readonly registerNumber: string;

  @IsOptional()
  @IsString()
  readonly systemOrigin: string;
}
