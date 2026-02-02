import { PartialType } from '@nestjs/swagger';
import { CreateRegistrationProcessAgencyDto } from './create-registration-process-agency.dto';

export class UpdateProcessAgencyDto extends PartialType(CreateRegistrationProcessAgencyDto) {}
