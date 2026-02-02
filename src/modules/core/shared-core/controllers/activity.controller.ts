import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, PublicRoute } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { PaginationDto } from '@utils/pagination';
import { ActivityService } from '@modules/core/shared-core/services/activity.service';
import {
  CreateActivityDto,
  FindActivityDto,
  UpdateActivityDto,
} from '@modules/core/shared-core/dto/activity';

@ApiTags('Activity')
@Auth()
@Controller('core/shared/activities')
export class ActivityController {
  constructor(private service: ActivityService) {}

  @PublicRoute()
  @ApiOperation({ summary: 'Find Cache' })
  @Get('cache')
  async findCache(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findCache();

    return {
      ...serviceResponse,
      message: `Cache de Actividades, Clasificaciones y Categorias Consultadas`,
      title: `Consultados`,
    };
  }

  @PublicRoute()
  @ApiOperation({ summary: 'Find Cache' })
  @Patch('cache')
  async loadCache(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.loadCache();

    return {
      ...serviceResponse,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @PublicRoute()
  @ApiOperation({ summary: 'Find All' })
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

  @ApiOperation({ summary: 'Find One' })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() options: FindActivityDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findOne(id, options);

    return {
      data: serviceResponse,
      message: `Registro Consultado`,
      title: `Consultado`,
    };
  }

  @ApiOperation({ summary: 'Create' })
  @Post()
  async create(@Body() payload: CreateActivityDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.create(payload);

    return {
      data: serviceResponse,
      message: `Registro Creado`,
      title: `Creado`,
    };
  }

  @ApiOperation({ summary: 'Update' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateActivityDto,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.update(id, payload);

    return {
      data: serviceResponse,
      message: `Registro Actualizado`,
      title: `Actualizado`,
    };
  }

  @ApiOperation({ summary: 'Delete' })
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.delete(id);

    return {
      data: serviceResponse,
      message: `Registro Eliminado`,
      title: `Eliminado`,
    };
  }
}
