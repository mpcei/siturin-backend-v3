import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';

@Injectable()
export class GuiaSieteService {
  constructor(@Inject(ConfigEnum.PG_DATA_SOURCE) private readonly dataSource: DataSource) {}

  async findGuideByIdentification(cedula: string): Promise<ServiceResponseHttpInterface> {
    const result = await this.dataSource.query(`SELECT * FROM guias WHERE cedula = $1`, [
      '2400313033',
    ]);

    console.log(result);
    return {
      data: result,
    };
  }
}
