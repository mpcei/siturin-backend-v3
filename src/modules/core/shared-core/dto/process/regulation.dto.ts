import { IsArray, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CategoryEntity } from '@modules/core/entities';
import { RegulationResponseDto } from '@modules/core/shared-core/dto/process/regulation-response.dto';
import { Type } from 'class-transformer';

export class RegulationDto {
  @IsOptional()
  category: CategoryEntity;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested()
  @Type(() => RegulationResponseDto)
  regulationResponses: RegulationResponseDto[];
}
