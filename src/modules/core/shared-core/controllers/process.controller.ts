import {
  Body,
  Controller,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { CreateStep1Dto, CreateStep2Dto } from '@modules/core/shared-core/dto/process';
import { InspectionDto } from '@modules/core/shared-core/dto/process/inspection.dto';
import { UserEntity } from '@auth/entities';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { fileFilter, getFileName } from '@utils/helpers';
import * as fs from 'node:fs';
import { format } from 'date-fns';

@ApiTags('Processes')
@Auth()
@Controller('core/shared/processes')
export class ProcessesController {
  constructor(private service: ProcessService) {}

  @ApiOperation({ summary: 'Create Step 1' })
  @Post('step1')
  async createStep1(@Body() payload: CreateStep1Dto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createStep1(payload);

    return {
      data: serviceResponse,
      message: `Registro Creado`,
      title: `Creado`,
    };
  }

  @ApiOperation({ summary: 'Create Step 2' })
  @Post('step2')
  async createStep2(@Body() payload: CreateStep2Dto): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createStep2(payload);

    return {
      data: serviceResponse,
      message: `Registro Creado`,
      title: `Creado`,
    };
  }

  @ApiOperation({ summary: 'Create External Inspection' })
  @Post('external-inspections')
  async createExternalInspection(
    @Body() payload: InspectionDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createExternalInspection(payload, user);

    return {
      data: serviceResponse,
      message: `Estimado Usuario, le recordamos que en la inspección se verificará el cumplimiento de todos los requisitos declarados y la normativa vigente. Le notificaremos a su correo electrónico registrado, la hora y fecha de inspección, nuestro horario de atención es de lunes a viernes de 08h00 a 16h30`,
      title: `Se agendó correctamente`,
    };
  }

  @ApiOperation({ summary: 'Create Internal Inspection' })
  @Post('internal-inspections')
  async createInternalInspection(
    @Body() payload: InspectionDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createInternalInspection(payload, user);

    return {
      data: serviceResponse,
      message: `Por favor revise la fecha generada`,
      title: `Se agendó correctamente`,
    };
  }

  @ApiOperation({ summary: 'Upload Files' })
  @Post('inspection-status/uploads')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const folder = (req.query.folder as string) || '';
          const year = format(new Date(), 'yyyy');

          const fullPath = join(process.cwd(), 'storage/private/uploads', year, folder);

          fs.mkdirSync(fullPath, { recursive: true });

          callback(null, fullPath);
        },
        filename: getFileName,
      }),
      fileFilter: fileFilter,
      limits: { fieldSize: 1024 },
    }),
  )
  async createFilesInspectionStatus(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query('modelId', ParseUUIDPipe) modelId: string,
    @Body('typeIds') typeIds: string[],
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    await this.service.createFilesInspectionStatus(files, modelId, typeIds, user);

    return {
      data: null,
      message: 'Archivos Subidos Correctamente',
      title: 'Archivos Subidos',
    };
  }
}
