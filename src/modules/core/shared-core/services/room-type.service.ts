import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CacheEnum } from '@utils/enums';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { RoomTypeEntity } from '@modules/core/entities';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RoomTypeService {
  private paginateFilterService: PaginateFilterService<RoomTypeEntity>;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(CoreRepositoryEnum.ROOM_TYPE_REPOSITORY)
    private readonly repository: Repository<RoomTypeEntity>,
  ) {
    this.paginateFilterService = new PaginateFilterService(this.repository);
  }

  async findCache(): Promise<RoomTypeEntity[]> {
    let roomTypes = (await this.cacheManager.get(CacheEnum.room_types)) as RoomTypeEntity[];

    if (roomTypes === null || roomTypes === undefined || roomTypes.length === 0) {
      roomTypes = await this.repository.find({
        select: ['id', 'code', 'name', 'isBed', 'isRoom', 'isPlace'],
        order: { name: 'asc' },
      });

      await this.cacheManager.set(CacheEnum.room_types, roomTypes);
    }

    return roomTypes;
  }

  async loadCache(): Promise<RoomTypeEntity[]> {
    const roomTypes = await this.repository.find({
      select: ['id', 'code', 'name', 'isBed', 'isRoom', 'isPlace'],
      order: { name: 'asc' },
    });

    await this.cacheManager.set(CacheEnum.room_types, roomTypes);

    return roomTypes;
  }
}
