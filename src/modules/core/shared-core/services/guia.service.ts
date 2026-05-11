import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { firstValueFrom } from 'rxjs';
import { retry } from 'rxjs/operators';
import { isEqual } from 'date-fns';
import { CatalogueEstablishmentsStateEnum, CoreCatalogueTypeEnum, CoreRepositoryEnum } from '@modules/core/utils/enums';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RucEntity } from '@modules/core/entities';
import { ProfessionalTitleEntity } from '@modules/core/entities/professional-title.entity';

@Injectable()
export class GuiaService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
    @Inject(CoreRepositoryEnum.PROFESSIONAL_TITLE_REPOSITORY)
    private readonly professionalTitleRepository: Repository<ProfessionalTitleEntity>,
    private readonly httpService: HttpService,
  ) {}

  async findGuideByIdentification(cedula: string): Promise<ServiceResponseHttpInterface> {
    const result = await this.dataSource.query(`SELECT * FROM guias WHERE cedula = $1`, [
      '2400313033',
    ]);

    console.log(result);
    return {
      data: result,
    };
  }

  async findMINEDECProfessionalTitles(cedula: string): Promise<ServiceResponseHttpInterface> {
    const url = `${this.configService.externalApis.urlDinardap}/minedec/${cedula}`;

    const response = await firstValueFrom(this.httpService.get(url).pipe(retry(3)));


    return { data: null };
  }
}
