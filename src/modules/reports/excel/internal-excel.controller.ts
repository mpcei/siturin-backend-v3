import { Controller, Get, Header, Param, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { InternalPdfService } from '@modules/reports/pdf/internal-pdf.service';
import { PublicRoute } from '@auth/decorators';
import { InternalExcelService } from '@modules/reports/excel/internal-excel.service';

@ApiTags('Internal EXCEL Reports')
@Controller('reports/excel/internals')
export class InternalExcelController {
  constructor(private readonly service: InternalExcelService) {}

  @PublicRoute()
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Get('technician-guide/processes')
  async generateProcessesByTechnicianGuide(
    @Res() response: Response,
    @Query('cadastreId', ParseUUIDPipe) cadastreId: string,
  ) {
    const excelBuffer = await this.service.generateProcesses({
      cadastreId,
    });

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="registration-certificate.xlsx"',
    );

    response.send(excelBuffer);
  }
}
