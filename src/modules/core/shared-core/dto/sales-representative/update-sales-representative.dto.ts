import { PartialType } from '@nestjs/swagger';
import { BaseSalesRepresentativeDto } from './base-sales-representative.dto';

export class UpdateSalesRepresentativeDto extends PartialType(BaseSalesRepresentativeDto) {}
