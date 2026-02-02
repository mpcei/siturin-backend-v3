import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { isStringValidationOptions } from '@utils/dto-validation';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { Type } from 'class-transformer';

export class TouristTransportCompanyDto {
  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly ruc: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly legalName: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly authorizationNumber: string;

  @IsOptional()
  @Type(() => CatalogueDto)
  readonly rucType: CatalogueDto;

  @IsOptional()
  @Type(() => CatalogueDto)
  readonly type: CatalogueDto;
}
