import { IsArray, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { BreachCauseDto, TouristGuideDto } from '@modules/core/shared-core/dto/process';

export class CreateTemporarySuspensionInspectionStatusDto {
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

  @IsArray()
  @ValidateNested()
  @Type(() => BreachCauseDto)
  readonly breachCauses: BreachCauseDto[];
}
