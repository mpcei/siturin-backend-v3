import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CacheEnum } from '@utils/enums';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { ActivityEntity, CategoryEntity, ClassificationEntity } from '@modules/core/entities';
import { PaginationDto } from '@utils/pagination';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';
import {
  CreateActivityDto,
  FindActivityDto,
  UpdateActivityDto,
} from '@modules/core/shared-core/dto/activity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ActivityService {
  private paginateFilterService: PaginateFilterService<ActivityEntity>;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(CoreRepositoryEnum.ACTIVITY_REPOSITORY)
    private readonly repository: Repository<ActivityEntity>,
    @Inject(CoreRepositoryEnum.CLASSIFICATION_REPOSITORY)
    private readonly classificationRepository: Repository<ClassificationEntity>,
    @Inject(CoreRepositoryEnum.CATEGORY_REPOSITORY)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {
    this.paginateFilterService = new PaginateFilterService(this.repository);
  }

  async findAll(params: PaginationDto): Promise<ServiceResponseHttpInterface> {
    const relations = ['classifications'];
    return this.paginateFilterService.execute({ params, searchFields: ['name'], relations });
  }

  async findOne(id: string, options: FindActivityDto): Promise<ActivityEntity> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: options.relations,
    });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    return entity;
  }

  async findCache(): Promise<ServiceResponseHttpInterface> {
    let activities = (await this.cacheManager.get(CacheEnum.ACTIVITIES)) as ActivityEntity[];
    let classifications = (await this.cacheManager.get(
      CacheEnum.CLASSIFICATIONS,
    )) as ClassificationEntity[];
    let categories = (await this.cacheManager.get(CacheEnum.CATEGORIES)) as CategoryEntity[];

    if (activities === null || activities === undefined || activities.length === 0) {
      activities = await this.repository.find({
        relations: { classifications: { categories: true } },
        order: { sort: 'asc', name: 'asc' },
      });

      await this.cacheManager.set(CacheEnum.ACTIVITIES, activities);
    }

    if (classifications === null || classifications === undefined || classifications.length === 0) {
      classifications = await this.classificationRepository.find({
        order: { sort: 'asc', name: 'asc' },
      });

      await this.cacheManager.set(CacheEnum.CLASSIFICATIONS, classifications);
    }

    if (categories === null || categories === undefined || categories.length === 0) {
      categories = await this.categoryRepository.find({
        order: { sort: 'asc', name: 'asc' },
      });

      await this.cacheManager.set(CacheEnum.CATEGORIES, categories);
    }

    return {
      data: {
        activities,
        classifications,
        categories,
      },
    };
  }

  async loadCache(): Promise<ServiceResponseHttpInterface> {
    const activities = await this.repository.find({
      order: { sort: 'asc', name: 'asc' },
    });

    const classifications = await this.classificationRepository.find({
      order: { sort: 'asc', name: 'asc' },
    });

    const categories = await this.categoryRepository.find({
      order: { sort: 'asc', name: 'asc' },
    });

    await this.cacheManager.set(CacheEnum.ACTIVITIES, activities);

    return {
      data: {
        activities,
        classifications,
        categories,
      },
    };
  }

  async create(payload: CreateActivityDto): Promise<ActivityEntity> {
    const entity = this.repository.create(payload);

    return await this.repository.save(entity);
  }

  async update(id: string, payload: UpdateActivityDto): Promise<ActivityEntity> {
    const entity = await this.findEntityOrThrow(id);

    this.repository.merge(entity, payload);

    return await this.repository.save(entity);
  }

  async delete(id: string): Promise<ActivityEntity> {
    const entity = await this.findEntityOrThrow(id);

    return await this.repository.softRemove(entity);
  }

  private async findEntityOrThrow(id: string): Promise<ActivityEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) throw new NotFoundException('Registro no encontrado');

    return entity;
  }
}
