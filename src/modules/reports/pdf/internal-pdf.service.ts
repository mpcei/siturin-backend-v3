import { Inject, Injectable } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { ConfigType } from '@nestjs/config';
import { envConfig } from '@config';
import { InternalPdfSql } from '@modules/reports/pdf/internal-pdf.sql';
import { registerCertificateReport } from '@modules/reports/pdf/templates/internals/register-certificate.report';
import { registerInactivation } from './templates/internals/inactivation.report';
import { registerSuspension } from './templates/internals/suspension.report';
import { registerUpdate } from './templates/internals/update.report';

@Injectable()
export class InternalPdfService {
  constructor(
    private readonly internalPdfSql: InternalPdfSql,
    private readonly printerService: PrinterService,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
  ) {}

  async generateUsersReportBuffer() {
    const data: any = await this.internalPdfSql.findUsers();
    // console.log(data);
    try {
      return await this.printerService.createPdfBuffer(registerCertificateReport(data));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  async generateRegisterCertificate({
    type = 'buffer',
    cadastreId,
  }: {
    type?: string;
    cadastreId: string;
  }): Promise<PDFKit.PDFDocument | Buffer> {
    const data: any = await this.internalPdfSql.findRegisterCertificate(cadastreId);

    try {
      if (type === 'buffer')
        return this.printerService.createPdfBuffer(registerCertificateReport(data));
      else return this.printerService.createPdf(registerCertificateReport(data));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  async generateInactivation({
    type = 'buffer',
    cadastreId,
  }: {
    type?: string;
    cadastreId: string;
  }): Promise<PDFKit.PDFDocument | Buffer> {
    const data: any = await this.internalPdfSql.findRegisterInactivation(cadastreId);

    try {
      if (type === 'buffer') return this.printerService.createPdfBuffer(registerInactivation(data));
      else return this.printerService.createPdf(registerInactivation(data));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
  async generateUpdate({
    type = 'buffer',
    cadastreId,
  }: {
    type?: string;
    cadastreId: string;
  }): Promise<PDFKit.PDFDocument | Buffer> {
    const data: any = await this.internalPdfSql.findRegisterUpdate(cadastreId);

    try {
      if (type === 'buffer') return this.printerService.createPdfBuffer(registerUpdate(data));
      else return this.printerService.createPdf(registerUpdate(data));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
  async generateSuspension({
    type = 'buffer',
    cadastreId,
  }: {
    type?: string;
    cadastreId: string;
  }): Promise<PDFKit.PDFDocument | Buffer> {
    const data: any = await this.internalPdfSql.findRegisterSuspension(cadastreId);

    try {
      if (type === 'buffer') return this.printerService.createPdfBuffer(registerSuspension(data));
      else return this.printerService.createPdf(registerSuspension(data));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
}
