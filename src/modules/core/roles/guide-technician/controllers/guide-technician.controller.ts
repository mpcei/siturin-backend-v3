import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { GuideTechnicianService } from '@modules/core/roles/guide-technician/services/guide-technician.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ParseMultipartInterceptor } from '@utils/interceptors';
import { UserEntity } from '@auth/entities';
import { PaginationDto } from '@utils/pagination';
import { InactivationDto } from '@modules/core/roles/external/dto/process-guide/inactivation.dto';
import { ResponseHttpInterface } from '@utils/interfaces';

@ApiTags('Guide Technician')
@Auth()
@Controller('core/guide-technician/process-guides')
export class GuideTechnicianController {
  constructor(private service: GuideTechnicianService) {}

  @ApiOperation({ summary: 'Lista de tramites pendiente de revisión' })
  @UseInterceptors(AnyFilesInterceptor(), ParseMultipartInterceptor)
  @Get('processes')
  async findProcessesByUser(@User() user: UserEntity, @Query() params: PaginationDto) {
    const serviceResponse = await this.service.findProcessesByUser(user, params);
    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Consulta exitosa',
      title: 'Consulta',
    };
  }

  @ApiOperation({ summary: 'Tramite pendiente de revisión' })
  @UseInterceptors(AnyFilesInterceptor(), ParseMultipartInterceptor)
  @Get('process')
  async findProcessById(@Query('processId') processId: string) {
    const serviceResponse = await this.service.findProcessById(processId);
    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }

  @ApiOperation({ summary: 'Registration Inactivation' })
  @UseInterceptors(AnyFilesInterceptor(), ParseMultipartInterceptor)
  @Post('processes/inactivated')
  async createInactivation(
    @Body() payload: InactivationDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createInactivation(payload, user);

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }
}
