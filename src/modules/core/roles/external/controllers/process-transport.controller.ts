import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { CreateRegistrationProcessAgencyDto } from '@modules/core/roles/external/dto/process-agency';
import { UserEntity } from '@auth/entities';
import { ProcessTransportService } from '@modules/core/roles/external/services/process-transport.service';

@ApiTags('Process Transport')
@Auth()
@Controller('core/external/process-transport')
export class ProcessTransportController {
  constructor(private service: ProcessTransportService) {}

  @ApiOperation({ summary: 'Registration Process' })
  @Post('registrations')
  async createRegistration(
    @Body() payload: CreateRegistrationProcessAgencyDto,
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
