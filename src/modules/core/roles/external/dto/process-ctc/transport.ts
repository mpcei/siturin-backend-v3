import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { isBooleanValidationOptions } from '@utils/dto-validation';
import { TouristTransportCompanyEntity } from '@modules/core/entities/tourist-transport-company.entity';
import { Type } from 'class-transformer';

export class TransportDto {
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => TouristTransportCompanyEntity)
  readonly touristTransportCompanies: TouristTransportCompanyEntity[];

  @IsBoolean(isBooleanValidationOptions())
  readonly hasTransports: boolean;
}
