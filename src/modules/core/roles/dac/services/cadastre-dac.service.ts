import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { CadastreEntity } from '@modules/core/entities';
import { CreateCadastreDto, UpdateCadastreDto } from '@modules/core/roles/dac/dto/cadastre';
import { PaginationDto } from '@utils/pagination';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';

@Injectable()
export class CadastreDacService {
  private paginateFilterService: PaginateFilterService<CadastreEntity>;

  constructor(
    @Inject(CoreRepositoryEnum.CADASTRE_REPOSITORY)
    private repository: Repository<CadastreEntity>,
  ) {
    this.paginateFilterService = new PaginateFilterService(this.repository);
  }

  async create(payload: CreateCadastreDto): Promise<ServiceResponseHttpInterface> {
    const entity = this.repository.create(payload);

    return { data: await this.repository.save(entity) };
  }

  async findAll(params: PaginationDto): Promise<ServiceResponseHttpInterface> {
    // return this.paginateFilterService.execute(params, ['registerNumber', 'systemOrigin']);

    const queryBuilder = this.repository.createQueryBuilder('cadastre');

    queryBuilder.select([
      'cadastre.id AS "id"',
      'cadastre.processId AS "processId"',
      'state.code AS "stateCode"',
      'state.name AS "stateName"',
      'cadastre.registeredAt AS "registeredAt"',
      'cadastre.registerNumber AS "registerNumber"',
      'processType.name AS "processTypeName"',
      'activity.name AS "activityName"',
      'classification.name AS "classificationName"',
      'category.name AS "categoryName"',
      'establishment.number AS "establishmentNumber"',
      'establishment.tradeName AS "establishmentTradeName"',
      'province.name AS "provinceName"',
      'canton.name AS "cantonName"',
      'parish.name AS "parishName"',
    ]);
    queryBuilder.leftJoin(`cadastre.process`, 'process');
    queryBuilder.leftJoin(`cadastre.cadastreState`, 'cadastreState');
    queryBuilder.leftJoin(`cadastreState.state`, 'state');
    queryBuilder.leftJoin(`process.type`, 'processType');
    queryBuilder.leftJoin(`process.establishment`, 'establishment');
    queryBuilder.leftJoin(`establishment.ruc`, 'ruc');
    queryBuilder.leftJoin(`process.activity`, 'activity');
    queryBuilder.leftJoin(`process.classification`, 'classification');
    queryBuilder.leftJoin(`process.category`, 'category');
    queryBuilder.leftJoin(`process.establishmentAddress`, 'establishmentAddress');
    queryBuilder.leftJoin(`establishmentAddress.province`, 'province');
    queryBuilder.leftJoin(`establishmentAddress.canton`, 'canton');
    queryBuilder.leftJoin(`establishmentAddress.parish`, 'parish');

    if (!params.search) {
      const idsQuery = this.repository
        .createQueryBuilder('cadastre')
        .select('cadastre.id')
        .orderBy('cadastre.createdAt', 'DESC')
        .skip(PaginationDto.getOffset(params.limit, params.page))
        .take(params.limit)
        .getQuery();

      console.log(idsQuery);
      queryBuilder.where(`cadastre.id IN (${idsQuery})`);
    }

    if (params.search) {
      queryBuilder.where(
        `
      cadastre.registerNumber ILIKE :search OR
      establishment.tradeName ILIKE :search OR
      ruc.number ILIKE :search
      `,
        {
          search: `%${params.search.trim()}%`,
        },
      );
    }

    const [data, totalItems] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ]);

    return {
      data,
      pagination: { limit: params.limit, totalItems },
    };
  }

  async findOne(id: string): Promise<ServiceResponseHttpInterface> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    return { data: entity };
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
