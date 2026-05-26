import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, PublicRoute } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { GuideService } from '../services/guide.service';

@ApiTags('Activity')
@Auth()
@Controller('core/shared/guides')
export class GuideController {
  constructor(private service: GuideService) {}

  @ApiOperation({ summary: 'Create Professional Title' })
  @Post('professional-titles')
  async createProfessionalTitleByIdentification(
    @Body('ruc') ruc: string,
    @Body('establishmentId') establishmentId: string,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createMINEDECProfessionalTitles(
      ruc,
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

  @ApiOperation({ summary: 'Update Guide Information' })
  @Patch('registro-civil/:ruc')
  async updateGuideInformation(@Param('ruc') ruc: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.updateGuideInformation(ruc);

    return {
      data: serviceResponse,
      message: `Información Actualizada`,
      title: `Actualizado`,
    };
  }

  @PublicRoute()
  @ApiOperation({ summary: 'Find Catastro Guias Siete' })
  @Get(':ruc')
  async findGuideByIdentification(@Param('ruc') ruc: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findGuideByIdentification(ruc);

    return {
      ...serviceResponse,
      message: `Cache de Actividades, Clasificaciones y Categorias Consultadas`,
      title: `Consultados`,
    };
  }
}
