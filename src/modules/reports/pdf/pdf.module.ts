import { Global, Module } from '@nestjs/common';
import { InternalPdfController } from '@modules/reports/pdf/internal-pdf.controller';
import { InternalPdfService } from '@modules/reports/pdf/internal-pdf.service';
import { InternalPdfSql } from '@modules/reports/pdf/internal-pdf.sql';
import { PrinterService } from '@modules/reports/pdf/printer.service';
import { coreProviders } from '@modules/core/core.provider';
import { ExternalPdfController } from '@modules/reports/pdf/external-pdf.controller';
import { ExternalPdfSql } from '@modules/reports/pdf/external-pdf.sql';
import { ExternalPdfService } from '@modules/reports/pdf/external-pdf.service';

@Global()
@Module({
  imports: [],
  controllers: [InternalPdfController, ExternalPdfController],
  providers: [
    ...coreProviders,
    InternalPdfService,
    InternalPdfSql,
    ExternalPdfService,
    ExternalPdfSql,
    PrinterService,
  ],
  exports: [InternalPdfService, ExternalPdfService],
})
export class PdfModule {}
