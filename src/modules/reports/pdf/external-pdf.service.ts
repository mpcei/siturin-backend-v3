import { Inject, Injectable } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { ConfigType } from '@nestjs/config';
import { envConfig } from '@config';
import { ExternalPdfSql } from '@modules/reports/pdf/external-pdf.sql';
import { guideInactivation } from '@modules/reports/pdf/templates/externals/guide-inactivation.report';

@Injectable()
export class ExternalPdfService {
  constructor(
    private readonly externalPdfSql: ExternalPdfSql,
    private readonly printerService: PrinterService,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
  ) {}

  async generateInactivation({
    type = 'buffer',
    cadastreId,

  }: {
    type?: string;
    cadastreId: string;
  }): Promise<PDFKit.PDFDocument | Buffer> {
    const data: any = await this.externalPdfSql.findRegisterInactivation(cadastreId);
    console.log('data', data);
    try {
      if (type === 'buffer') return this.printerService.createPdfBuffer(guideInactivation(data));
      else return this.printerService.createPdf(guideInactivation(data));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
}
