import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { ProcessGuideService } from '@modules/core/roles/external/services/process-guide.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { BaseProcessGuideDto } from '@modules/core/roles/external/dto/process-guide';
import { ParseFormPayloadJsonPipe } from '@utils/pipes';
import { UserEntity } from '@auth/entities';
import { ParseMultipartInterceptor } from '@utils/interceptors';
import {
  BaseWithOriginProcessGuideDto
} from '@modules/core/roles/external/dto/process-guide/base-with-origin-process-guide.dto';
import { InactivationDto } from '@modules/core/roles/external/dto/process-guide/inactivation.dto';

@ApiTags('Process Guide')
@Auth()
@Controller('core/external/process-guides')
export class ProcessGuideController {
  constructor(
    private readonly service: ProcessGuideService,
    private readonly validationPipe: ValidationPipe,
    private readonly parseFormPayloadJsonPipe: ParseFormPayloadJsonPipe,
  ) {}

  @ApiOperation({ summary: 'Registration Process' })
  @UseInterceptors(AnyFilesInterceptor(), ParseMultipartInterceptor)
  @Post('registrations')
  async createRegistration(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('payload') payload: BaseProcessGuideDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createRegistration(payload, user, files);

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }

  @ApiOperation({ summary: 'Registration Process Current Credential' })
  @UseInterceptors(AnyFilesInterceptor(), ParseMultipartInterceptor)
  @Post('current-registrations')
  async createCurrentRegistration(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('payload') payload: BaseWithOriginProcessGuideDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createCurrentRegistration(payload, user, files);

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }

  @ApiOperation({ summary: 'Registration Process Current Credential' })
  @UseInterceptors(AnyFilesInterceptor(), ParseMultipartInterceptor)
  @Post('expired-registrations')
  async createExpiredRegistration(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('payload') payload: BaseWithOriginProcessGuideDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createExpiredRegistration(payload, user, files);

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

  @ApiOperation({ summary: 'Registration Inactivation' })
  @UseInterceptors(AnyFilesInterceptor(), ParseMultipartInterceptor)
  @Post('processes/automatic-inactivated')
  async createAutomaticInactivation(): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createAutomaticInactivation();

    return {
      data: serviceResponse.data,
      message: serviceResponse.message,
      title: serviceResponse.title,
    };
  }
}
