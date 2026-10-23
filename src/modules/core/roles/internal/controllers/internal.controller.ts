import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { PaginationDto } from '@utils/pagination';
import {
  DpaInternalUserDto,
  InternalService,
  InternalUserDto,
  UpdateProcessDto,
} from '../services/internal.service';

@ApiTags('internal Users ')
@Auth()
@Controller('core/internal')
export class InternalController {
  constructor(private service: InternalService) {}

  @ApiOperation({ summary: 'List internal users' })
  @Get('user-list')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() params: PaginationDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.getInternalUsersList(params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @ApiOperation({ summary: 'List Dpa internal users' })
  @Get(':internalUserId/dpa-internal')
  @HttpCode(HttpStatus.OK)
  async findDpaUser(
    @Param('internalUserId') internalUserid: string,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findInternalUserDpa(internalUserid);

    return {
      data: serviceResponse,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @ApiOperation({ summary: 'Register a general user as an internal user' })
  @Post('register-internal-user')
  @HttpCode(HttpStatus.CREATED)
  async createInternalUser(@Body('userId') userId: string): Promise<any> {
    const serviceResponse = await this.service.createInternalUser(userId);
    return {
      data: serviceResponse,
      message: `Usuario Interno Asignado`,
      title: `Usuario Registrado`,
    };
  }
  @ApiOperation({ summary: 'Available internal user' })
  @Post('available')
  @HttpCode(HttpStatus.CREATED)
  async availableInternalUser(@Body() payload: InternalUserDto): Promise<any> {
    const serviceResponse = await this.service.internalUserAvailable(payload);
    return {
      data: serviceResponse,
      message: `Usuario Interno Asignado`,
      title: `Usuario Registrado`,
    };
  }
  @ApiOperation({ summary: 'Create Dpa internal user' })
  @Post('add-dpa')
  @HttpCode(HttpStatus.CREATED)
  async createDpaInternalUser(@Body() payload: DpaInternalUserDto): Promise<any> {
    const serviceResponse = await this.service.createDpaInternaluser(payload);
    return {
      data: serviceResponse,
      message: `Dpa Asignado`,
      title: `Registrado`,
    };
  }
  @ApiOperation({ summary: 'Create Dpa internal user' })
  @Delete(':dpaId/delete-dpa')
  @HttpCode(HttpStatus.CREATED)
  async deleteDpaInternalUser(@Param('dpaId') dpaId: string): Promise<any> {
    const serviceResponse = await this.service.deleteDpaInternaluser(dpaId);
    return {
      data: serviceResponse,
      message: `Dpa Eliminado`,
      title: `Eliminar Registro`,
    };
  }
  @ApiOperation({ summary: 'Create Dpa internal user' })
  @Post('enabled-dpa')
  @HttpCode(HttpStatus.CREATED)
  async enabledDpaInternalUser(@Body() payload: InternalUserDto): Promise<any> {
    const serviceResponse = await this.service.enabledDpaInternaluser(payload);
    return {
      data: serviceResponse,
      message: `Dpa actualizado`,
      title: `Registrado`,
    };
  }

  @ApiOperation({ summary: 'List Process' })
  @Get('process-list')
  @HttpCode(HttpStatus.OK)
  async findAllProcess(@Query() params: PaginationDto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findAllProcess(params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: `Registros Consultados`,
      title: `Consultados`,
    };
  }

  @ApiOperation({ summary: 'Create Dpa internal user' })
  @Post('process-date')
  @HttpCode(HttpStatus.CREATED)
  async updateinspectionDate(@Body() payload: UpdateProcessDto): Promise<any> {
    const serviceResponse = await this.service.updateProcess(payload);
    return {
      data: serviceResponse,
      message: `Tramite actualizado`,
      title: `Registrado`,
    };
  }
}
