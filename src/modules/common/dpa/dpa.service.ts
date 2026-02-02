import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CacheEnum, CommonRepositoryEnum } from '@utils/enums';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DpaEntity } from '@modules/common/dpa/dpa.entity';

@Injectable()
export class DpaService {
  clientRedis: any = null;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(CommonRepositoryEnum.DPA_REPOSITORY)
    private repository: Repository<DpaEntity>,
  ) {}

  async findCache(): Promise<DpaEntity[]> {
    let items = (await this.cacheManager.get(CacheEnum.DPA)) as DpaEntity[];

    if (items === null || items === undefined || items.length === 0) {
      items = await this.repository.find({
        select: ['id', 'parentId', 'code', 'name', 'latitude', 'longitude', 'zoneType'],
        order: { name: 'asc' },
      });

      await this.cacheManager.set(CacheEnum.DPA, items);
    }

    return items;
  }

  async loadCache(): Promise<DpaEntity[]> {
    const items = await this.repository.find({
      select: ['id', 'parentId', 'code', 'name', 'latitude', 'longitude', 'zoneType'],
      order: { name: 'asc' },
    });

    await this.cacheManager.set(CacheEnum.DPA, items);

    return items;
  }
}
