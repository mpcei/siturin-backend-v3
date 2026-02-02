import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateCatalogueDto, UpdateCatalogueDto } from '@modules/common/catalogue/dto';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { CacheEnum, CommonRepositoryEnum } from '@utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaginateFilterService, PaginationDto } from '@utils/pagination';

@Injectable()
export class CataloguesService {
  clientRedis: any = null;
  private readonly paginateFilterService: PaginateFilterService<CatalogueEntity>;

  constructor(
    @Inject(CommonRepositoryEnum.CATALOGUE_REPOSITORY)
    private repository: Repository<CatalogueEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.paginateFilterService = new PaginateFilterService(this.repository);
  }

  async create(payload: CreateCatalogueDto): Promise<CatalogueEntity> {
    const entityExist = await this.repository.findOne({
      where: [{ code: payload.code, type: payload.type }],
    });

    if (entityExist) throw new BadRequestException('El registro ya existe');

    const entity = this.repository.create(payload);

    return await this.repository.save(entity);
  }

  async findAll(params: PaginationDto): Promise<ServiceResponseHttpInterface> {
    return this.paginateFilterService.execute({
      params,
      searchFields: ['name', 'description'],
    });
  }

  async findOne(id: string): Promise<CatalogueEntity> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    return entity;
  }

  async update(id: string, payload: UpdateCatalogueDto): Promise<CatalogueEntity> {
    const entity = await this.repository.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    this.repository.merge(entity, payload);

    return await this.repository.save(entity);
  }

  async delete(id: string): Promise<CatalogueEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    return await this.repository.softRemove(entity);
  }

  async findCache(): Promise<CatalogueEntity[]> {
    // Recuperar del cache
    const cached = await this.cacheManager.get<CatalogueEntity[]>(CacheEnum.CATALOGUES);

    if (cached?.length) {
      return cached;
    }

    // Si no hay cache, consultar la BD
    const catalogues = await this.repository.find({
      select: ['id', 'code', 'name', 'type', 'enabled', 'parentId', 'acronym', 'required'],
      order: {
        type: 'asc',
        sort: 'asc',
        name: 'asc',
      },
    });

    // Guardar en cache con TTL opcional
    await this.cacheManager.set(CacheEnum.CATALOGUES, catalogues, 300);

    return catalogues;
  }

  async loadCache(): Promise<boolean> {
    const catalogues = await this.repository.find({
      select: ['id', 'code', 'name', 'type', 'enabled', 'parentId', 'acronym', 'required'],
      order: { type: 'asc', sort: 'asc', name: 'asc' },
    });

    await this.cacheManager.set<CatalogueEntity[]>(CacheEnum.CATALOGUES, catalogues, 300);

    return true;
  }
}
