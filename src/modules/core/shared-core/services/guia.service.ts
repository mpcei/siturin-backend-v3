import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { firstValueFrom } from 'rxjs';
import { retry } from 'rxjs/operators';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ProfessionalTitleEntity } from '@modules/core/entities/professional-title.entity';

interface minedecProfessionalTitle {
  nombre: string;
  numeroRegistro: string;
  fechaRegistro: string;
  institucion: string;
  tipoNivel: string;
  nivel: string;
}

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

  async createMINEDECProfessionalTitles(cedula: string, establishmentId: string): Promise<boolean> {
    const url = `${this.configService.externalApis.urlDinardap}/minedec/${cedula}`;

    const response = await firstValueFrom(this.httpService.get(url).pipe(retry(3)));

    if (response.data) {
      return false;
    }

    const minedecProfessionalTitles: minedecProfessionalTitle[] = response.data.data;

    for (const minedecProfessionalTitle of minedecProfessionalTitles) {
      let professionalTitle = await this.professionalTitleRepository.findOne({
        where: { establishmentId, registerNumber: minedecProfessionalTitle.numeroRegistro },
      });

      if (!professionalTitle) {
        professionalTitle = this.professionalTitleRepository.create();
        professionalTitle.establishmentId = establishmentId;
        professionalTitle.name = minedecProfessionalTitle.nombre;
        professionalTitle.institutionName = minedecProfessionalTitle.institucion;
        professionalTitle.levelCode = minedecProfessionalTitle.tipoNivel;
        professionalTitle.levelName = minedecProfessionalTitle.nivel;
        professionalTitle.registerNumber = minedecProfessionalTitle.numeroRegistro;
        professionalTitle.registerDate = new Date(minedecProfessionalTitle.fechaRegistro);
        await this.professionalTitleRepository.save(professionalTitle);
      }
    }

    return true;
  }

  async findProfessionalTitleByIdentification(
    establishmentId: string,
  ): Promise<ProfessionalTitleEntity[]> {
    return await this.professionalTitleRepository.find({
      where: { establishmentId },
    });
  }
}
