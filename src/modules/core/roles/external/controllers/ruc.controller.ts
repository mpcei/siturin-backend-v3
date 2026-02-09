import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { PaginationDto } from '@utils/pagination';
import { EstablishmentService } from '@modules/core/roles/external/services/establishment.service';

@ApiTags('External Cadastre')
@Auth()
@Controller('core/external/rucs')
export class RucController {
  constructor(private service: EstablishmentService) {}

  @ApiOperation({ summary: 'List all Cadastres' })
  @Get(':ruc/establishments')
  async findEstablishmentsByRuc(
    @Query() params: PaginationDto,
    @Param('ruc') ruc: string,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findEstablishmentsByRuc(params, ruc);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: `Establecimientos Actualizados`,
      title: `Actualizadoa`,
    };
  }
}
