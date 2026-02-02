import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { isBooleanValidationOptions } from '@utils/dto-validation';
import { Type } from 'class-transformer';
import { TouristTransportCompanyDto } from '@modules/core/shared-core/dto/process';

export class TransportDto {
  @IsBoolean(isBooleanValidationOptions())
  readonly hasTouristTransportCompanies: boolean;

  @IsOptional()
  @IsArray()
  // @ValidateNested()
  @Type(() => TouristTransportCompanyDto)
  readonly touristTransportCompanies: TouristTransportCompanyDto[];
}
