import { PartialType } from '@nestjs/swagger';
import { BaseTouristGuideDto } from '@modules/core/shared-core/dto/tourist-guide/base-tourist-guide.dto';

export class UpdateActivityDto extends PartialType(BaseTouristGuideDto) {}
