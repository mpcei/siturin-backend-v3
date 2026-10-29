import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiClientsService } from '../services/api-clients.service';
import { ResponseHttpInterface } from '@utils/interfaces';
import { PublicRoute } from '@auth/decorators';

// Importa aquí el guard administrativo REAL de tu proyecto.
// Estos endpoints nunca deben quedar públicos.

@Controller('auth/api-clients')
export class ApiClientsController {
  constructor(private readonly service: ApiClientsService) {}

  // Aplica aquí tu guard JWT y la autorización de administrador.
  // Ejemplo: @UseGuards(JwtAuthGuard, RolesGuard)
  @PublicRoute()
  @Post()
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      expiresAt?: string;
    },
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.create(
      body.name,
      body.description,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );

    return {
      data: serviceResponse,
      title: '',
      message: `Created `,
    };
  }

  @Get()
  async findAll(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findAll();
    return { data: serviceResponse, title: '', message: `Find ` };
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.deactivate(id);
    return {
      data: serviceResponse,
      title: '',
      message: `Deactivated `,
    };
  }

  @Post(':id/rotate')
  async rotateKey(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.rotateKey(id);
    return {
      data: serviceResponse,
      title: '',
      message: `RotateKey `,
    };
  }
}
