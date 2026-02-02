import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { CategoryEntity } from '@modules/core/entities';

export class CreateRecategorizedInspectionStatusDto {
  @IsNotEmpty()
  @IsUUID()
  readonly cadastreId: string;

  @IsNotEmpty()
  @IsUUID()
  readonly processId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CatalogueDto)
  readonly state: CatalogueDto;

  @IsNotEmpty()
  @Type(() => CategoryEntity)
  readonly category: CategoryEntity;
}
