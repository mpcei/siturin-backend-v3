import { Auth, User } from '@auth/decorators';
import { UserEntity } from '@auth/entities';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseHttpInterface } from '@utils/interfaces';
import { ProcessParkService } from '../services/process-park.service';
import { CreateRegistrationProcessParkDto } from '@modules/core/roles/external/dto/process-park';

@ApiTags('Process Park')
@Auth()
@Controller('core/external/process-parks')
export class ProcessParkController {
  constructor(private service: ProcessParkService) {}

  @ApiOperation({ summary: 'Registrar actividad de parques' })
  @Post('registrations')
  async createRegistration(
    @Body() payload: CreateRegistrationProcessParkDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createRegistration(payload, user);

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }
}
