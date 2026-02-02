import { Auth, User } from '@auth/decorators';
import { UserEntity } from '@auth/entities';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseHttpInterface } from '@utils/interfaces';
import { CreateRegistrationProcessEventDto } from '../dto/process-event';
import { ProcessEventService } from '../services/process-event.service';

@ApiTags('Process Event')
@Auth()
@Controller('core/external/process-events')
export class ProcessEventController {
  constructor(private service: ProcessEventService) {}

  @ApiOperation({ summary: 'Registrar actividad de evento' })
  @Post('registrations')
  async createRegistration(
    @Body() payload: CreateRegistrationProcessEventDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    //console.log('Payload recibido:', payload);
    const serviceResponse = await this.service.createRegistration(payload, user);

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }
}
