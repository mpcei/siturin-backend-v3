import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { GuideTechnicianService } from '@modules/core/roles/guide-technician/services/guide-technician.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ParseMultipartInterceptor } from '@utils/interceptors';
import { UserEntity } from '@auth/entities';
import { PaginationDto } from '@utils/pagination';
import { InactivationDto } from '@modules/core/roles/external/dto/process-guide/inactivation.dto';
import { ResponseHttpInterface } from '@utils/interfaces';
import { DocumentReviewDto } from '@modules/core/roles/guide-technician/dto/guide-technician';

@ApiTags('Guide Technician')
@Auth()
@Controller('core/guide-technician/process-guides')
export class GuideTechnicianController {
  constructor(private service: GuideTechnicianService) {}

  @ApiOperation({ summary: 'Lista de tramites pendiente de revisión' })
  @Get('processes')
  async findProcessesByUser(
    @User() user: UserEntity,
    @Query() params: PaginationDto,
    @Query('rolCode') rolCode: string,
  ) {
    const serviceResponse = await this.service.findProcessesByUser(user, params, rolCode);
    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Consulta exitosa',
      title: 'Consulta',
    };
  }

  @ApiOperation({ summary: 'Tramite pendiente de revisión' })
  @Get('processes/:processId')
  async findProcessById(
    @Param('processId', ParseUUIDPipe) processId: string,
    @User() user: UserEntity,
    @Query('rolCode') rolCode: string,
  ) {
    const serviceResponse = await this.service.findProcessById(user, processId, rolCode);
    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }

  @ApiOperation({ summary: 'Registration Result Technician' })
  @Post('processes/review')
  async saveResultProcessTechnician(
    @Body() payload: DocumentReviewDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.saveResultProcessTechnician(payload, user);

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }

  @ApiOperation({ summary: 'Registration Inactivation' })
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
