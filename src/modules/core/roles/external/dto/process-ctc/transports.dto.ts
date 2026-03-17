import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { isBooleanValidationOptions, isPositiveValidationOptions } from '@utils/dto-validation';
import { TouristTransportCompanyEntity } from '@modules/core/entities/tourist-transport-company.entity';
import { Type } from 'class-transformer';
import { CatalogueDto } from '@modules/common/catalogue/dto';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

// export class TransportsDTO {
//   @IsOptional()
//     @IsPositive(isPositiveValidationOptions())
//     readonly authorizationNumber: number;
//   @IsOptional()
//     @IsPositive(isPositiveValidationOptions())
//     readonly ruc: number;

//     @IsObject()
//       @Type(() => CatalogueEntity)
//       readonly types: CatalogueEntity;

// }
