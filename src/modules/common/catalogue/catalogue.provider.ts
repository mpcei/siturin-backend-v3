import { DataSource } from 'typeorm';
import { CommonRepositoryEnum, ConfigEnum } from '@utils/enums';
import { CatalogueEntity } from './catalogue.entity';
import { ModelCatalogueEntity } from '@modules/common/catalogue/model-catalogue.entity';

export const catalogueProvider = [
  {
    provide: CommonRepositoryEnum.CATALOGUE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CatalogueEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CommonRepositoryEnum.MODEL_CATALOGUE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ModelCatalogueEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
];
