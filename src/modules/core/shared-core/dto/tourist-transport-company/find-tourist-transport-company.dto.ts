import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindTouristTransportCompanyDto {
  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  relations?: string[];

  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  select?: string[];
}
