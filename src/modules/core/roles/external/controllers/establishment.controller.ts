import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { CreateCadastreDto } from '@modules/core/roles/external/dto/cadastre';
import { PaginationDto } from '@utils/pagination';
import { EstablishmentService } from '@modules/core/roles/external/services/establishment.service';

@ApiTags('External Cadastre')
@Auth()
@Controller('core/external/establishments')
export class EstablishmentController {
  constructor(private service: EstablishmentService) {}

  @ApiOperation({ summary: 'List all Cadastres' })
  @Get()
  async findAll(@Query() params: PaginationDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findAll(params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @ApiOperation({ summary: 'List all Cadastres' })
  @Get('sri/:ruc')
  async findSRIEstablishments(@Param('ruc') ruc: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.updateSRIEstablishments(ruc);

    return {
      data: serviceResponse.data,
      message: `Establecimientos Actualizados`,
      title: `Actualizadoa`,
    };
  }

  @ApiOperation({ summary: 'Find One' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findOne(id);

    return {
      data: serviceResponse,
      message: `Registro Consultado`,
      title: `Consultado`,
    };
  }

  @ApiOperation({ summary: 'Create Cadastre' })
  @Post()
  async create(@Body() payload: CreateCadastreDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.create(payload);

    return {
      data: serviceResponse.data,
      message: `Registro Creado`,
      title: `Creado`,
    };
  }

  @ApiOperation({ summary: 'Update Cadastre' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: CreateCadastreDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.update(id, payload);

    return {
      data: serviceResponse.data,
      message: `Registro Actualizado`,
      title: `Actualizado`,
    };
  }

  @ApiOperation({ summary: 'Delete Cadastre' })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.remove(id);

    return {
      data: serviceResponse.data,
      message: `Registro Eliminado`,
      title: `Eliminado`,
    };
  }

  @ApiOperation({ summary: 'Find Degrees' })
  @Get('minedec/:cedula')
  async findDegreesByCedula(@Param('cedula') cedula: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findDegreesByCedula(cedula);

    return {
      data: serviceResponse,
      message: `Registro Consultado`,
      title: `Consultado`,
    };
  }

  @ApiOperation({ summary: 'Find One Cadastre' })
  @Get(':id/cadastres')
  async findCadastreByEstablishment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findCadastreByEstablishment(id);

    return {
      data: serviceResponse,
      message: `Registro Consultado`,
      title: `Consultado`,
    };
  }
}
