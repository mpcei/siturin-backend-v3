import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchCadastreService } from '@modules/core/shared-core/services/search-cadastre.service';
import { PublicRoute } from '@auth/decorators';
import { memoryStorage } from 'multer';
import { ApiOperation } from '@nestjs/swagger';
import { FindCadastresDto } from '@modules/core/shared-core/dto/search-cadastre/find-cadastres.dto';

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
  /*
  @PublicRoute()
  @Get()
  async findByRuc(@Query() params: any) {
    const response = await this.searchCadastreService.findCadastreByRuc(params);
    return {
      data: response,
      message: 'cadastres found',
      title: 'find',
    };
  }*/
}
