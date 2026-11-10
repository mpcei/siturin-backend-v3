import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@auth/decorators';
import { InternalExcelService } from '@modules/reports/excel/internal-excel.service';
import { UserEntity } from '@auth/entities';
import { FindCadastreDto } from '@modules/core/shared-core/dto/search-cadastre/find-cadastre.dto';

@ApiTags('Internal EXCEL Reports')
@Controller('reports/excel/internals')
export class InternalExcelController {
  constructor(private readonly service: InternalExcelService) {}

  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="bandeja_tecnico.xlsx"')
  @Get('technician-guide/processes')
  async generateProcessesByTechnicianGuide(
    @Res() response: Response,
    @User() user: UserEntity,
    @Query('rolCode') rolCode: string,
    @Query('isCurrent') isCurrent: boolean,
  ) {
    const excelBuffer = await this.service.generateProcesses(user.id, rolCode, isCurrent);
    response.send(excelBuffer);
  }

  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="catastro_guias.xlsx"')
  @Get('guide-cadastres')
  async generateGuideCadastresByRol(@Res() response: Response, @Query('rolCode') rolCode: string) {
    const excelBuffer = await this.service.generateGuideCadastres(rolCode);
    response.send(excelBuffer);
  }

  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="catastro.xlsx"')
  @Get('search-cadastres')
  async generateCadastres(@Res() response: Response, @Query() params: FindCadastreDto) {
    const excelBuffer = await this.service.generateCadastres(params);
    response.send(excelBuffer);
  }
}
