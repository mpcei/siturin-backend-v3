import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PublicRoute, User } from '@auth/decorators';
import { InternalExcelService } from '@modules/reports/excel/internal-excel.service';
import { UserEntity } from '@auth/entities';
import { FindProcessesDto } from '@modules/core/roles/guide-technician/dto/guide-technician/find-processes.dto';

@ApiTags('Internal EXCEL Reports')
@Controller('reports/excel/internals')
export class InternalExcelController {
  constructor(private readonly service: InternalExcelService) {}

  @PublicRoute()
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Get('technician-guide/processes')
  async generateProcessesByTechnicianGuide(
    @Res() response: Response,
    @User() user: UserEntity,
    @Query() params: FindProcessesDto,
  ) {
    const excelBuffer = await this.service.generateProcesses(
      user.id,
      params.rolCode,
      params.isCurrent,
    );

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="registration-certificate.xlsx"',
    );

    response.send(excelBuffer);
  }
}
