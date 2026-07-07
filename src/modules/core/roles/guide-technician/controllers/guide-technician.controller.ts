import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { GuideTechnicianService } from '@modules/core/roles/guide-technician/services/guide-technician.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ParseMultipartInterceptor } from '@utils/interceptors';
import { UserEntity } from '@auth/entities';
import { PaginationDto } from '@utils/pagination';

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
}
