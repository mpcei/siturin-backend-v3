import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, User } from '@auth/decorators';
import { ResponseHttpInterface } from '@utils/interfaces';
import {
  CreateDefinitiveSuspensionInspectionStatusDto,
  CreateInactivationInspectionStatusDto,
  CreateRecategorizedInspectionStatusDto,
  CreateReclassifiedInspectionStatusDto,
  CreateRegistrationInspectionStatusDto,
} from '@modules/core/shared-core/dto/cadastre';
import { CadastreService } from '@modules/core/shared-core/services/cadastre.service';
import { UserEntity } from '@auth/entities';
import { CreateTemporarySuspensionInspectionStatusDto } from '@modules/core/shared-core/dto/cadastre/create-temporary-suspension-inspection-status.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { fileFilter, getFileName } from '@utils/helpers';

@ApiTags('Cadastre')
@Auth()
@Controller('core/shared/cadastres')
export class CadastreController {
  constructor(private service: CadastreService) {}

  @ApiOperation({ summary: 'Create Inspection Status' })
  @Post('inspections/registration-status')
  async createRegistrationInspectionStatus(
    @Body() payload: CreateRegistrationInspectionStatusDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createRegistrationInspectionStatus(payload, user);

    return {
      data: serviceResponse,
      message: 'Ha finalizado la inspección',
      title: 'Guardado Correctamente',
    };
  }

  @ApiOperation({ summary: 'Create Reclassified Inspection Status' })
  @Post('inspections/reclassified-status')
  async createReclassifiedInspectionStatus(
    @Body() payload: CreateReclassifiedInspectionStatusDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createReclassifiedInspectionStatus(payload, user);

    return {
      data: serviceResponse,
      message: 'Ha finalizado la inspección',
      title: 'Guardado Correctamente',
    };
  }

  @ApiOperation({ summary: 'Create Recategorized Inspection Status' })
  @Post('inspections/recategorized-status')
  async createRecategorizedInspectionStatus(
    @Body() payload: CreateRecategorizedInspectionStatusDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createRecategorizedInspectionStatus(payload, user);

    return {
      data: serviceResponse,
      message: 'Ha finalizado la inspección',
      title: 'Guardado Correctamente',
    };
  }

  @ApiOperation({ summary: 'Create Temporary Suspension Inspection Status' })
  @Post('inspections/temporary-suspension-status')
  async createTemporarySuspensionInspectionStatus(
    @Body() payload: CreateTemporarySuspensionInspectionStatusDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createTemporarySuspensionInspectionStatus(
      payload,
      user,
    );

    return {
      data: serviceResponse,
      message: 'El tramite se encuentra en suspensión temporal',
      title: 'Guardado Correctamente',
    };
  }

  @ApiOperation({ summary: 'Create Definitive Suspension Inspection Status' })
  @Post('inspections/definitive-suspension-status')
  async createDefinitiveStatus(
    @Body() payload: CreateDefinitiveSuspensionInspectionStatusDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createDefinitiveSuspensionInspectionStatus(
      payload,
      user,
    );

    return {
      data: serviceResponse,
      message: 'Ha finalizado la inspección',
      title: 'Guardado Correctamente',
    };
  }

  @ApiOperation({ summary: 'Create Inactivation Inspection Status' })
  @Post('inspections/inactivation-status')
  async createInactivationStatus(
    @Body() payload: CreateInactivationInspectionStatusDto,
    @User() user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const serviceResponse = await this.service.createInactivationInspectionStatus(payload, user);

    return {
      data: serviceResponse,
      message: 'Ha finalizado la inspección',
      title: 'Guardado Correctamente',
    };
  }
}
