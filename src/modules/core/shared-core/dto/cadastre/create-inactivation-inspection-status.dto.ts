import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { InactivationCauseDto } from '@modules/core/shared-core/dto/process';

export class CreateInactivationInspectionStatusDto {
  @IsNotEmpty()
  @IsUUID()
  readonly cadastreId: string;

  @IsNotEmpty()
  @Type(() => CatalogueDto)
  readonly state: CatalogueDto;

  @IsNotEmpty()
  @Type(() => CatalogueDto)
  readonly inactivationCauseType: CatalogueDto;

  @IsArray()
  @Type(() => InactivationCauseDto)
  readonly inactivationCauses: InactivationCauseDto[];
}
