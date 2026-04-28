import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, PublicRoute } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { GuiaSieteService } from '@modules/core/shared-core/services/guia-siete.service';

@ApiTags('Activity')
@Auth()
@Controller('core/shared/guias-siete')
export class GuiaSieteController {
  constructor(private service: GuiaSieteService) {}

  @PublicRoute()
  @ApiOperation({ summary: 'Find Catastro Guias Siete' })
  @Get(':cedula')
  async findGuideByIdentification(@Query('cedula') cedula: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findGuideByIdentification(cedula);

    return {
      ...serviceResponse,
      message: `Cache de Actividades, Clasificaciones y Categorias Consultadas`,
      title: `Consultados`,
    };
  }
}
