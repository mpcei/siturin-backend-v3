import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthRepositoryEnum, ConfigEnum, GuideRepositoryEnum } from '@utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { firstValueFrom } from 'rxjs';
import { retry } from 'rxjs/operators';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ProfessionalTitleEntity } from '@modules/core/entities/professional-title.entity';
import { UserEntity } from '@auth/entities';
import { CataloguesService } from '@modules/common/catalogue/catalogue.service';
import { RequirementConfigurationEntity } from '@modules/core/entities/requirement-configuration.entity';

interface minedecProfessionalTitle {
  nombre: string;
  numeroRegistro: string;
  fechaRegistro: string;
  institucion: string;
  tipoNivel: string;
  nivel: string;
}

@Injectable()
export class GuideService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(AuthRepositoryEnum.USER_REPOSITORY)
    private readonly userRepository: Repository<UserEntity>,
    private readonly catalogueService: CataloguesService,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
    @Inject(CoreRepositoryEnum.PROFESSIONAL_TITLE_REPOSITORY)
    private readonly professionalTitleRepository: Repository<ProfessionalTitleEntity>,
    @Inject(GuideRepositoryEnum.REQUIREMENT_CONFIGURATION_REPOSITORY)
    private readonly requirementConfigurationRepository: Repository<RequirementConfigurationEntity>,
    private readonly httpService: HttpService,
  ) {}

  async findGuideByIdentification(ruc: string): Promise<ServiceResponseHttpInterface> {
    const cedula = ruc.substring(0, 10);
    const result = await this.dataSource.query(`SELECT * FROM public.guias WHERE cedula = $1`, [
      cedula,
    ]);

    return {
      data: result,
    };
  }

  async findRequirementConfiguration(
    classificationId: string,
    professionalTypeCode: string,
  ): Promise<ServiceResponseHttpInterface> {
    const result = await this.requirementConfigurationRepository.find({
      where: {
        classificationId: classificationId,
        professionalTypeCode: professionalTypeCode,
        enabledRegister: true,
      },
      relations: { requirement: true },
      order: { sortRegister: 'ASC' },
    });

    return {
      data: result,
    };
  }

  async createMINEDECProfessionalTitles(ruc: string, establishmentId: string): Promise<boolean> {
    const cedula = ruc.substring(0, 10);
    const url = `${this.configService.externalApis.urlDinardap}/minedec/${cedula}`;

    const response = await firstValueFrom(this.httpService.get(url).pipe(retry(3)));

    console.log(response.data);
    if (Array.isArray(response.data?.data) && response.data?.data?.length === 0) {
      throw new NotFoundException({
        message: response.data?.msg?.detail,
        error: response.data?.msg?.summary,
      });
    }

    const minedecProfessionalTitles: minedecProfessionalTitle[] = response.data.data;

    for (const minedecProfessionalTitle of minedecProfessionalTitles) {
      console.log(minedecProfessionalTitle);
      let professionalTitle = await this.professionalTitleRepository.findOne({
        where: { establishmentId, registerNumber: minedecProfessionalTitle.numeroRegistro },
      });

      if (!professionalTitle) {
        professionalTitle = this.professionalTitleRepository.create();
        professionalTitle.establishmentId = establishmentId;
        professionalTitle.name = minedecProfessionalTitle.nombre;
        professionalTitle.institutionName = minedecProfessionalTitle.institucion;
        if (!minedecProfessionalTitle.tipoNivel) {
          throw new NotFoundException({
            error: 'MINEDEC: Nivel de estudio no encontrado',
            message: minedecProfessionalTitle.nombre,
          });
        }
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

  async updateGuideInformation(ruc: string): Promise<any> {
    const cedula = ruc.substring(0, 10);
    const url = `${this.configService.externalApis.urlDinardap}/registro-civil/${cedula}`;

    const response = await firstValueFrom(this.httpService.get(url));

    const data = response.data.data;

    const user = await this.userRepository.findOne({ where: { identification: ruc } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const catalogues = await this.catalogueService.findCache();

    const nationality = catalogues.find(
      (item) => item.name?.trim().toLowerCase() === data.nacionalidad?.trim().toLowerCase(),
    );
    const sex = catalogues.find(
      (item) => item.name?.trim().toLowerCase() === data.sexo?.trim().toLowerCase(),
    );

    if (sex?.id) user.sex = sex;
    if (nationality?.id) user.nationality = nationality;

    const [day, month, year] = data.fechaNacimiento.split('/').map(Number);

    user.birthdate = new Date(year, month - 1, day);

    return await this.userRepository.save(user);
  }
}
