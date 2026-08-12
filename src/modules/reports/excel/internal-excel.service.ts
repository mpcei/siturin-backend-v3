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

  async generateProcesses(userId: string, rolCode: string, isCurrent: boolean): Promise<Buffer> {
    const data = await this.sql.findProcesses(userId, rolCode, isCurrent);
    try {
      return this.printerService.createXlsxBuffer(processesReport(data));
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
}
