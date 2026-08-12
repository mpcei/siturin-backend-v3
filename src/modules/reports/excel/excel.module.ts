import { Global, Module } from '@nestjs/common';
import { InternalExcelController } from '@modules/reports/excel/internal-excel.controller';
import { PrinterService } from '@modules/reports/excel/printer.service';
import { InternalExcelService } from '@modules/reports/excel/internal-excel.service';
import { InternalExcelSql } from '@modules/reports/excel/internal-excel.sql';
import { coreProviders } from '@modules/core/core.provider';

@Global()
@Module({
  controllers: [InternalExcelController],
  imports: [],
  providers: [...coreProviders, InternalExcelService, InternalExcelSql, PrinterService],
  exports: [InternalExcelService],
})
export class ExcelModule {}
