import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { envConfig } from '@config';
import { InternalExcelSql } from '@modules/reports/excel/internal-excel.sql';
import { PrinterService } from '@modules/reports/excel/printer.service';
import { processesReport } from '@modules/reports/excel/templates/processes.report';

@Injectable()
export class InternalExcelService {
  constructor(
    private readonly sql: InternalExcelSql,
    private readonly printerService: PrinterService,

    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
  ) {}

  async generateProcesses({ cadastreId }: { cadastreId: string }): Promise<Buffer> {
    const data = await this.sql.findProcesses(cadastreId);

    try {
      return this.printerService.createXlsxBuffer(processesReport(data.processes));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
}
