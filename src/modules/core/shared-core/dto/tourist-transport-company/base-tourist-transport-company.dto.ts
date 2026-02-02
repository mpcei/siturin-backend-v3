import { IsBoolean, IsUUID, IsOptional, IsString, ValidateNested } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { Type } from 'class-transformer';
import { CatalogueDto } from '@modules/common/catalogue/dto';

export class BaseTouristTransportCompanyDto {
  @IsUUID()
  readonly processId: string;

  @IsString(isStringValidationOptions())
  readonly ruc: string;

  @IsString(isStringValidationOptions())
  readonly legalName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogueDto)
  readonly type: CatalogueDto;

  @IsBoolean(isBooleanValidationOptions())
  readonly enabled: boolean;
}
