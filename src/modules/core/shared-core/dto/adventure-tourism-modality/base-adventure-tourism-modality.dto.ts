import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CatalogueDto } from '@modules/common/catalogue/dto';

export class BaseAdventureTourismModalityDto {
  @IsUUID()
  readonly processId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogueDto)
  readonly type: CatalogueDto;

  @IsString()
  readonly className: string;
}
