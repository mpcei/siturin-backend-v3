import { Controller, Get, Header, Param, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { InternalPdfService } from '@modules/reports/pdf/internal-pdf.service';
import { PublicRoute } from '@auth/decorators';

@ApiTags('Internal PDF Reports')
@Controller('reports/pdf/internals')
export class InternalPdfController {
  constructor(private readonly internalPdfService: InternalPdfService) {}

  @PublicRoute()
  @Get('users')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=users-report.pdf') // o "attachment;"
  async generateUsersReportBuffer() {
    return await this.internalPdfService.generateUsersReportBuffer();
  }

  @PublicRoute()
  @Header('Content-Type', 'application/pdf')
  @Get('registration-certificate')
  async generateRegisterCertificate(
    @Res() response: Response,
    @Query('cadastreId', ParseUUIDPipe) cadastreId: string,
  ) {
    const pdfDoc: PDFKit.PDFDocument =
      (await this.internalPdfService.generateRegistrationCertificate({
        type: 'pdf',
        cadastreId: cadastreId,
      })) as PDFKit.PDFDocument;

    pdfDoc.info.Title = 'Users Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @PublicRoute()
  @Header('Content-Type', 'application/pdf')
  @Get('registration-certificate-guide')
  async generateRegisterCertificateGuide(
    @Res() response: Response,
    @Query('cadastreId', ParseUUIDPipe) cadastreId: string,
  ) {
    const pdfDoc: PDFKit.PDFDocument =
      (await this.internalPdfService.generateRegistrationCertificateGuide({
        type: 'pdf',
        cadastreId: cadastreId,
      })) as PDFKit.PDFDocument;

    pdfDoc.info.Title = 'Users Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @PublicRoute()
  @Header('Content-Type', 'application/pdf')
  @Get('inactivation')
  async generateInactivation(
    @Res() response: Response,
    @Query('cadastreId', ParseUUIDPipe) cadastreId: string,
  ) {
    const pdfDoc: PDFKit.PDFDocument = (await this.internalPdfService.generateInactivation({
      type: 'pdf',
      cadastreId: cadastreId,
    })) as PDFKit.PDFDocument;

    pdfDoc.info.Title = 'Users Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @PublicRoute()
  @Header('Content-Type', 'application/pdf')
  @Get('update/:cadastreId')
  async generateUpdate(
    @Res() response: Response,
    @Param('cadastreId', ParseUUIDPipe) cadastreId: string,
  ) {
    const pdfDoc: PDFKit.PDFDocument = (await this.internalPdfService.generateUpdate({
      type: 'pdf',
      cadastreId: cadastreId,
    })) as PDFKit.PDFDocument;

    pdfDoc.info.Title = 'Users Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @PublicRoute()
  @Header('Content-Type', 'application/pdf')
  @Get('suspension/:cadastreId')
  async generateSuspension(
    @Res() response: Response,
    @Param('cadastreId', ParseUUIDPipe) cadastreId: string,
  ) {
    const pdfDoc: PDFKit.PDFDocument = (await this.internalPdfService.generateSuspension({
      type: 'pdf',
      cadastreId: cadastreId,
    })) as PDFKit.PDFDocument;

    pdfDoc.info.Title = 'Users Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
