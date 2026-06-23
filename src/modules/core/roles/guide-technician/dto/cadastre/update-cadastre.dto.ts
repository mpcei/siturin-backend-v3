import { PartialType } from '@nestjs/swagger';
import { CreateCadastreDto } from './create-cadastre.dto';

export class UpdateCadastreDto extends PartialType(CreateCadastreDto) {}
