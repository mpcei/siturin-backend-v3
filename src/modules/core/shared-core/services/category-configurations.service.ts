import { CategoryConfigurationEntity } from '@modules/core/entities';
import { Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';

export class CategoryConfigurationsService {
  constructor(
    @Inject(CoreRepositoryEnum.CATEGORY_CONFIGURATION_REPOSITORY)
    private readonly repository: Repository<CategoryConfigurationEntity>,
  ) {}

  async findByClassificationId(classificationId: string) {
    return this.repository.find({
      where: {
        classificationId,
      },
      relations: { category: true },
    });
  }
}
