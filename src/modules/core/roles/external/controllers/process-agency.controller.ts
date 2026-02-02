import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { CreateRegistrationProcessAgencyDto } from '@modules/core/roles/external/dto/process-agency';
import { ProcessAgencyService } from '@modules/core/roles/external/services/process-agency.service';
import { UserEntity } from '@auth/entities';

@ApiTags('Process Agency')
@Auth()
@Controller('core/external/process-agencies')
export class ProcessAgencyController {
  constructor(private service: ProcessAgencyService) {}

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
