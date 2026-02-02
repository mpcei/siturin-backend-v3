import { PartialType } from '@nestjs/swagger';
import { BaseTouristTransportCompanyDto } from './base-tourist-transport-company.dto';

export class UpdateTouristTransportCompanyDto extends PartialType(BaseTouristTransportCompanyDto) {}
