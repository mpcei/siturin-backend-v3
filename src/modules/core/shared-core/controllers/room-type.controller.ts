import { Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, PublicRoute } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { RoomTypeService } from '@modules/core/shared-core/services/room-type.service';

@ApiTags('Rooom Type')
@Auth()
@Controller('core/shared/room-types')
export class RoomTypeController {
  constructor(private service: RoomTypeService) {}

  @PublicRoute()
  @ApiOperation({ summary: 'Find Cache' })
  @Get('cache')
  async findCache(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.findCache();

    return {
      data: serviceResponse,
      message: `Cache Room Types`,
      title: `Cache`,
    };
  }

  @ApiOperation({ summary: 'Load Cache' })
  @Patch('cache')
  async loadCache(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.loadCache();

    return {
      data: serviceResponse,
      message: `Load Cache Room Types`,
      title: `Load Cache`,
    };
  }
}
