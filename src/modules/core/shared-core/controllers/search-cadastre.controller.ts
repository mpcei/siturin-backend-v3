import {
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
import { PublicRoute } from '@auth/decorators';
import { memoryStorage } from 'multer';
import { ApiOperation } from '@nestjs/swagger';
import { FindCadastresDto } from '@modules/core/shared-core/dto/search-cadastre/find-cadastres.dto';
import { ApiKeyGuard } from '@auth/guards/api-key.guard';

@Controller('core/shared/search-cadastres')
export class SearchCadastreController {
  constructor(private readonly service: SearchCadastreService) {}

  @PublicRoute()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @Post('upload')
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    return this.service.saveExcelCadastre(file);
  }

  @PublicRoute()
  @ApiOperation({ summary: 'Lista de catastrados' })
  @Get('find')
  async findCadastres(@Query() params: FindCadastresDto) {
    const serviceResponse = await this.service.findCadastres(params);

    return {
      data: serviceResponse.data,
      pagination: serviceResponse.pagination,
      message: 'Consulta exitosa',
      title: 'Consulta',
    };
  }

  @PublicRoute()
  @UseGuards(ApiKeyGuard)
  @Get()
  async findByRuc(@Query('ruc') ruc: string) {
    return await this.service.findCadastreByRuc(ruc);
  }
}
