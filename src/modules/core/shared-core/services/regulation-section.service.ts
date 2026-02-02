import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegulationSectionEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';

@Injectable()
export class RegulationSectionService {
  constructor(
    @Inject(CoreRepositoryEnum.REGULATION_SECTION_REPOSITORY)
    private readonly regulationSectionRepository: Repository<RegulationSectionEntity>,
  ) {}

  async findAll(): Promise<RegulationSectionEntity[]> {
    return this.regulationSectionRepository.find({ relations: ['items'] });
  }

  findSectionsByModelId(modelId: string): Promise<RegulationSectionEntity[]> {
    const sections = this.regulationSectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.items', 'item', 'item.enabled = :enabled', {
        enabled: true,
      })
      .where('section.modelId = :modelId', { modelId })
      .andWhere('section.enabled = true')
      .andWhere('section.is_adventure_requirement = false')
      .orderBy('section.sort', 'ASC')
      .addOrderBy('item.sort', 'ASC')
      .getMany();
    return sections;
  }

  findAdventureSectionsByModelId(modelId: string): Promise<RegulationSectionEntity[]> {
    return this.regulationSectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.items', 'item', 'item.enabled = :enabled', {
        enabled: true,
      })
      .where('section.modelId = :modelId', { modelId })
      .andWhere('section.enabled = true')
      .andWhere('section.is_adventure_requirement = true')
      .orderBy('section.sort', 'ASC')
      .addOrderBy('item.sort', 'ASC')
      .getMany();
  }
}
