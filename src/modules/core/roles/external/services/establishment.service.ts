import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreCatalogueTypeEnum, CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { EstablishmentEntity, RucEntity } from '@modules/core/entities';
import { CreateCadastreDto, UpdateCadastreDto } from '@modules/core/roles/external/dto/cadastre';
import { PaginationDto } from '@utils/pagination';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { envConfig } from '@config';
import { ConfigType } from '@nestjs/config';
import { CataloguesService } from '@modules/common/catalogue/catalogue.service';
import { retry } from 'rxjs/operators';
import { format, isEqual, isSameDay, parse, startOfDay } from 'date-fns';

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
      .leftJoin('e.ruc', 'ruc')
      .leftJoinAndSelect('e.process', 'process')
      .leftJoinAndSelect('e.state', 'establishmentState')
      .leftJoinAndSelect('process.cadastre', 'cadastre')
      .leftJoinAndSelect('cadastre.cadastreState', 'cadastreState')
      .leftJoinAndSelect('cadastreState.state', 'state')
      .where('ruc.number = :ruc', { ruc })
      .addSelect('CAST(e.number AS INTEGER)', 'number_int')
      .orderBy('number_int', 'ASC')
      .skip(PaginationDto.getOffset(params.limit, params.page))
      .take(params.limit)
      .getManyAndCount();

    return {
      data,
      pagination: { totalItems, limit: params.limit },
    };
  }

  async updateSRIEstablishments(rucNumber: string): Promise<ServiceResponseHttpInterface> {
    const url = `${this.configService.externalApis.urlDinardap}/sri/${rucNumber}`;

    const response = await firstValueFrom(this.httpService.get(url).pipe(retry(3)));

    const ruc = await this.rucRepository.findOne({
      where: { number: rucNumber },
    });

    if (!ruc || !response.data) {
      return { data: null };
    }

    if (
      isEqual(ruc.lastUpdatedAt, new Date(response.data.data.fechaActualizacion.substring(0, 10)))
    ) {
      return { data: null };
    }

    const catalogues = await this.cataloguesService.findCache();
    const sriEstablishments: SriEstablishment[] = response.data.data.establecimientos;

    for (const sriEstablishment of sriEstablishments) {
      const state = catalogues.find(
        (catalogue) =>
          catalogue.type === CoreCatalogueTypeEnum.establishments_state &&
          catalogue.code === (sriEstablishment.estado === 'ABIERTO' ? 'open' : 'closed'),
      );

      let establishment = await this.repository.findOne({
        where: {
          number: sriEstablishment.numero,
          ruc: { id: ruc.id },
        },
      });

      if (!establishment) {
        establishment = this.repository.create();
        establishment.ruc = { id: ruc.id } as any;
      }

      establishment.number = sriEstablishment.numero;
      establishment.tradeName = sriEstablishment.nombreComercial;
      establishment.mainStreet = sriEstablishment.callePrincipal;
      establishment.numberStreet = sriEstablishment.calleNumeracion;
      establishment.secondaryStreet = sriEstablishment.calleInterseccion;
      establishment.referenceStreet = sriEstablishment.calleReferencia;
      if (state) establishment.state = state;

      await this.repository.save(establishment);
    }

    return { data: null };
  }

  async findOne(id: string): Promise<EstablishmentEntity> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: {
        ruc: true,
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
}
