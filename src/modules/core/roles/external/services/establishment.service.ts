import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import {
  CatalogueEstablishmentsStateEnum,
  CatalogueProcessesStateEnum,
  CoreCatalogueTypeEnum,
  CoreRepositoryEnum,
} from '@modules/core/utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { EstablishmentEntity, ProcessEntity, RucEntity } from '@modules/core/entities';
import { CreateCadastreDto, UpdateCadastreDto } from '@modules/core/roles/external/dto/cadastre';
import { PaginationDto } from '@utils/pagination';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { CataloguesService } from '@modules/common/catalogue/catalogue.service';
import { retry } from 'rxjs/operators';
import { isEqual } from 'date-fns';
import { CatalogueTypeEnum } from '@utils/enums';

interface SriEstablishment {
  numero: string;
  nombreComercial: string;
  callePrincipal: string;
  calleNumeracion: string;
  calleInterseccion: string;
  calleReferencia: string;
  estado: string;
}

@Injectable()
export class EstablishmentService {
  private paginateFilterService: PaginateFilterService<EstablishmentEntity>;

  constructor(
    @Inject(CoreRepositoryEnum.ESTABLISHMENT_REPOSITORY)
    private readonly repository: Repository<EstablishmentEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private readonly processRepository: Repository<ProcessEntity>,
    @Inject(CoreRepositoryEnum.RUC_REPOSITORY)
    private readonly rucRepository: Repository<RucEntity>,
    private readonly cataloguesService: CataloguesService,
    private readonly httpService: HttpService,
    @Inject(envConfig.KEY) private configService: ConfigType<typeof envConfig>,
  ) {
    this.paginateFilterService = new PaginateFilterService(this.repository);
  }

  async create(payload: CreateCadastreDto): Promise<ServiceResponseHttpInterface> {
    const entity = this.repository.create(payload);

    return { data: await this.repository.save(entity) };
  }

  async findAll(params: PaginationDto): Promise<ServiceResponseHttpInterface> {
    return this.paginateFilterService.execute({ params, searchFields: ['tradeName'] });
  }

  async findEstablishmentsByRuc(
    params: PaginationDto,
    ruc: string,
  ): Promise<ServiceResponseHttpInterface> {
    const [data, totalItems] = await this.repository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.ruc', 'ruc')
      .leftJoinAndSelect('e.province', 'provinces')
      .leftJoinAndSelect('e.canton', 'cantons')
      .leftJoinAndSelect('e.parish', 'parishes')
      .leftJoinAndSelect('e.process', 'process')
      .leftJoinAndSelect('e.state', 'establishmentState')
      .leftJoinAndSelect('process.state', 'processState')
      .leftJoinAndSelect('process.cadastre', 'cadastre')
      .leftJoinAndSelect('process.activity', 'activities')
      .leftJoinAndSelect('process.classification', 'classifications')
      .leftJoinAndSelect('cadastre.cadastreState', 'cadastreState')
      .leftJoinAndSelect('cadastreState.state', 'state')
      .where('ruc.number = :ruc', { ruc })
      .addSelect('CAST(e.number AS INTEGER)', 'number_int')
      .orderBy('number_int', 'ASC')
      .skip(PaginationDto.getOffset(params.limit, params.page))
      .take(params.limit)
      .getManyAndCount();

    console.log(data)
    const excludedStatuses = ['approved', 'rejected', 'document_rejected'];

    const establishments = data.map((establishment) => ({
      ...establishment,
      process:
        establishment.process && excludedStatuses.includes(establishment.process.state.code)
          ? null
          : establishment.process,
    }));

    return {
      data: establishments,
      pagination: { totalItems, limit: params.limit },
    };
  }

  async updateSRIEstablishments(rucNumber: string): Promise<ServiceResponseHttpInterface> {
    const url = `${this.configService.externalApis.urlDinardap}/sri/${rucNumber}`;

    const response = await firstValueFrom(this.httpService.get(url).pipe(retry(3)));

    let rucEntity = await this.rucRepository.findOne({
      where: { number: rucNumber },
    });

    if (!response.data) {
      return { data: null };
    }

    if (!rucEntity) {
      const catalogues = await this.cataloguesService.findCache();
      const state = catalogues.find(
        (item) => item.code === response.data.data.estadoContribuyente.toLowerCase(),
      );
      const type = catalogues.find(
        (item) => item.acronym === response.data.data.tipoContribuyente.toLowerCase(),
      );

      rucEntity = this.rucRepository.create();
      rucEntity.mainEconomicActivity = response.data.data.actividadEconomicaPrincipal;
      rucEntity.legalRepresentativeIdentification = response.data.data.cedulaRepresentanteLegal;
      rucEntity.legalRepresentativeNames = response.data.data.nombreRepresentanteLegal;
      rucEntity.legalName = response.data.data.razonSocial;
      rucEntity.number = response.data.data.ruc;

      if (state) rucEntity.state = state;
      if (type) rucEntity.type = type;

      await this.rucRepository.save(rucEntity);
    }

    if (
      isEqual(
        rucEntity.lastUpdatedAt,
        new Date(response.data.data.fechaActualizacion.substring(0, 10)),
      )
    ) {
      return { data: null };
    }

    const catalogues = await this.cataloguesService.findCache();
    const sriEstablishments: SriEstablishment[] = response.data.data.establecimientos;

    console.log(response.data.data.establecimientos);

    for (const sriEstablishment of sriEstablishments) {
      const state = catalogues.find(
        (catalogue) =>
          catalogue.type === CoreCatalogueTypeEnum.establishments_state &&
          catalogue.code ===
            (sriEstablishment.estado === 'ABIERTO'
              ? CatalogueEstablishmentsStateEnum.open
              : CatalogueEstablishmentsStateEnum.closed),
      );

      let establishment = await this.repository.findOne({
        where: {
          number: sriEstablishment.numero,
          ruc: { id: rucEntity.id },
        },
      });

      if (!establishment) {
        establishment = this.repository.create();
        establishment.rucId = rucEntity.id;

        establishment.number = sriEstablishment.numero;
        establishment.tradeName = sriEstablishment.nombreComercial;
        establishment.mainStreet = sriEstablishment.callePrincipal;
        establishment.numberStreet = sriEstablishment.calleNumeracion;
        establishment.secondaryStreet = sriEstablishment.calleInterseccion;
        establishment.referenceStreet = sriEstablishment.calleReferencia;
      }

      if (state) establishment.state = state;

      await this.repository.save(establishment);
      rucEntity.lastUpdatedAt = new Date(response.data.data.fechaActualizacion.substring(0, 10));
    }

    return { data: null };
  }

  async findOne(id: string): Promise<EstablishmentEntity> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: {
        ruc: { state: true },
        state: true,
        processes: { cadastre: { cadastreState: { state: true } } },
        establishmentAddress: { province: true, canton: true, parish: true },
      },
    });

    if (!entity) {
      throw new NotFoundException('Establecimiento no encontrado');
    }

    return entity;
  }

  async update(id: string, payload: UpdateCadastreDto): Promise<ServiceResponseHttpInterface> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    this.repository.merge(entity, payload);

    return { data: await this.repository.save(entity) };
  }

  async remove(id: string): Promise<ServiceResponseHttpInterface> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    return { data: await this.repository.softRemove(entity) };
  }

  async findDegreesByCedula(cedula: string): Promise<any> {
    const url = `${this.configService.externalApis.urlDinardap}/minedec/${cedula}`;

    const response = await lastValueFrom(this.httpService.get(url));

    return response.data.data.map((item) => {
      return {
        registered: item.fechaRegistro,
        institution: item.institucion,
        level: item.nivel,
        name: item.nombre,
        registerNumber: item.numeroRegistro,
      };
    });
  }

  async findCadastreByEstablishment(establishmentId: string): Promise<any> {
    const approved = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code === CatalogueProcessesStateEnum.approved &&
        item.type === CoreCatalogueTypeEnum.processes_state,
    );

    const completed = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code === CatalogueProcessesStateEnum.completed &&
        item.type === CoreCatalogueTypeEnum.processes_state,
    );

    const cadastre = await this.repository.findOne({
      where: {
        id: establishmentId,
        credentials: { enabled: true },
        process: { stateId: In([approved?.id, completed?.id]) },
      },
      relations: {
        establishmentContactPerson: true,
        process: { cadastre: { state: true }, activity: true },
        credentials: { classification: true, geographicArea: true },
        languages: true,
        adventureModalities: true,
        ruc: true,
        province: true,
        canton: true,
        parish: true,
      },
      order: {
        process: { createdAt: 'desc' },
        establishmentContactPerson: { isCurrent: 'desc' },
      },
    });

    const establishment = await this.repository.findOne({
      where: {
        id: establishmentId,
      },
      relations: {
        process: { credentials: { classification: true }, assignment: true },
      },
      order: {
        process: {
          createdAt: 'desc',
          credentials: { createdAt: 'desc' },
          assignment: { createdAt: 'desc' },
        },
      },
    });

    const state = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueProcessesStateEnum.in_progress &&
        item.type == CoreCatalogueTypeEnum.processes_state,
    );

    const process = await this.processRepository.findOne({
      where: { stateId: state?.id, establishmentId },
      relations: { type: true },
      order: { createdAt: 'desc' },
    });

    return {
      ...cadastre,
      currentProcess: process,
      currentCredentials: establishment?.process?.credentials,
      currentAssignment: establishment?.process?.assignment,
    };
  }
}
