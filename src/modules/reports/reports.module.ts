import { Global, Module } from '@nestjs/common';
import { PdfModule } from '@modules/reports/pdf/pdf.module';
import { ExcelModule } from '@modules/reports/excel/excel.module';

@Global()
@Module({
  imports: [PdfModule, ExcelModule],
  exports: [PdfModule, ExcelModule],
})
export class ReportsModule {}
