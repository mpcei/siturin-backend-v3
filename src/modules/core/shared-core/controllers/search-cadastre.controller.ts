import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchCadastreService } from '@modules/core/shared-core/services/search-cadastre.service';
import { PublicRoute, User } from '@auth/decorators';
import { memoryStorage } from 'multer';
import { ApiOperation } from '@nestjs/swagger';
import { FindCadastreDto } from '@modules/core/shared-core/dto/search-cadastre/find-cadastre.dto';
import { ApiKeyGuard } from '@auth/guards/api-key.guard';
import { UserEntity } from '@auth/entities';
import {
  BaseWithOriginProcessGuideDto
} from '@modules/core/roles/external/dto/process-guide/base-with-origin-process-guide.dto';
import { DocumentCadastreDto } from '@modules/core/shared-core/dto/search-cadastre/document-cadastre.dto';

@Controller('core/shared/search-cadastres')
export class SearchCadastreController {
  constructor(private readonly service: SearchCadastreService) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @Post('upload')
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserEntity,
    @Body('payload') payload: any,
  ) {
    console.log('payload', payload);
    return this.service.saveExcelCadastre(payload, user, file);
  }

  @PublicRoute()
  @ApiOperation({ summary: 'Lista de catastrados' })
  @Get('find')
  async findCadastres(@Query() params: FindCadastreDto) {
    const serviceResponse = await this.service.findCadastres(params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Consulta exitosa',
      title: 'Consulta',
    };
  }

  @PublicRoute()
  @ApiOperation({ summary: 'Archivo catastro' })
  @Get('file')
  async findDocumentCadastre() {
    return await this.service.findDocumentCadastre();
  }

  @PublicRoute()
  @UseGuards(ApiKeyGuard)
  @Get()
  async findByRuc(@Query('ruc') ruc: string) {
    return await this.service.findCadastreByRuc(ruc);
  }
}
