import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchCadastreService } from '@modules/core/shared-core/services/search-cadastre.service';
import { PublicRoute } from '@auth/decorators';
import { memoryStorage } from 'multer';

@Controller('core/shared/search-cadastres')
export class SearchCadastreController {
  constructor(private readonly searchCadastreService: SearchCadastreService) {}

  /**
   * Cargar archivo Excel y almacenar los registros en Redis.
   * POST /search-cadastre/upload
   */
  @PublicRoute()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @Post('upload')
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    return this.searchCadastreService.saveExcelCadastre(file);
  }

  /**
   * Descargar el archivo Excel reconstruido desde Redis.
   * GET /search-cadastre/download
   */
  @PublicRoute()
  @Get('download')
  async downloadExcel(): Promise<StreamableFile> {
    const buffer = await this.searchCadastreService.downloadExcelCadastre();

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="catastro.xlsx"',
    });
  }

  /**
   * Buscar todos los registros asociados a un RUC.
   * GET /search-cadastre/ruc/:ruc
   */
  @PublicRoute()
  @Get()
  async findByRuc(@Query() params: any) {
    const response = await this.searchCadastreService.findCadastreByRuc(params);
    return {
      data: response,
      message: 'cadastres found',
      title: 'find',
    };
  }
}
