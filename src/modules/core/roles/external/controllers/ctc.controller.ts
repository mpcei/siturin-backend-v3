import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { UserEntity } from '@auth/entities';
import { CreateRegistrationProcessCtcDto } from '@modules/core/roles/external/dto/process-ctc/create-registration-process-ctc.dto';
import { ProcessCtcService } from '../services/process-ctc.service';

@ApiTags('Process Ctc')
@Auth()
@Controller('core/external/process-ctc')
export class ProcessCtcController {
  constructor(private service: ProcessCtcService) {}

  @ApiOperation({ summary: 'Registration Process' })
  @Post('registrations')
  async createRegistration(
    @Body() payload: CreateRegistrationProcessCtcDto,
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
