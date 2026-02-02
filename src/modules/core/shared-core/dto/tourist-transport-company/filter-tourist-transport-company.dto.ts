import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@utils/pagination';

export class FilterTouristTransportCompanyDto extends PaginationDto {
  @IsOptional()
  @IsString()
  readonly ruc?: string;

  @IsOptional()
  @IsString()
  readonly legalName?: string;
}
