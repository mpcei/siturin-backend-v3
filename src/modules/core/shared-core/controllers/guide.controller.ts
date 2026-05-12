import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, PublicRoute } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { GuideService } from '../services/guide.service';

@ApiTags('Activity')
@Auth()
@Controller('core/shared/guides')
export class GuideController {
  constructor(private service: GuideService) {}

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

  @PublicRoute()
  @ApiOperation({ summary: 'Create Professional Title' })
  @Post('professional-titles')
  async createProfessionalTitleByIdentification(
    @Body('cedula') cedula: string,
    @Body('establishmentId') establishmentId: string,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createMINEDECProfessionalTitles(
      cedula,
      establishmentId,
    );

    return {
      data: serviceResponse,
      message: `Títulos profesionales guardados con éxito`,
      title: `Creados`,
    };
  }

  @ApiOperation({ summary: 'Find Professional Title' })
  @Get('professional-titles/:establishmentId')
  async findProfessionalTitleByIdentification(
    @Param('establishmentId') establishmentId: string,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse =
      await this.service.findProfessionalTitleByIdentification(establishmentId);

    return {
      data: serviceResponse,
      message: `Títulos profesionales consultados`,
      title: `Consultados`,
    };
  }
}
