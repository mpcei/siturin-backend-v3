import { PartialType } from '@nestjs/swagger';
import { BaseAdventureTourismModalityDto } from './base-adventure-tourism-modality.dto';

export class UpdateAdventureTourismModalityDto extends PartialType(
  BaseAdventureTourismModalityDto,
) {}
