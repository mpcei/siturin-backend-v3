import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { isBooleanValidationOptions, isStringValidationOptions } from '@utils/dto-validation';
import { Type } from 'class-transformer';
import { CatalogueDto } from '@modules/common/catalogue/dto';

export class AdventureTourismModalityDto {
  @IsNotEmpty()
  // @ValidateNested()
  @Type(() => CatalogueDto)
  readonly type: CatalogueDto;

  @IsString(isStringValidationOptions())
  readonly className: string;
}
