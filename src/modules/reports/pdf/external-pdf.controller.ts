import { Controller, Get, Header, Param, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ExternalPdfService } from '@modules/reports/pdf/external-pdf.service';
import { PublicRoute } from '@auth/decorators';

@ApiTags('External PDF Reports')
@Controller('reports/pdf/externals')
export class ExternalPdfController {
  constructor(private readonly externalPdfService: ExternalPdfService) {}

  @PublicRoute()
  @Header('Content-Type', 'application/pdf')
  @Get('inactivation')
  async generateInactivation(
    @Res() response: Response,
    @Query('cadastreId', ParseUUIDPipe) cadastreId: string,
  ) {
    const pdfDoc: PDFKit.PDFDocument = (await this.externalPdfService.generateInactivation({
      type: 'pdf',
      cadastreId: cadastreId,
    })) as PDFKit.PDFDocument;

    pdfDoc.info.Title = 'Users Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
