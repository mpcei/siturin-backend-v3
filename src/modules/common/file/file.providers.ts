import { DataSource } from 'typeorm';
import { ConfigEnum, CommonRepositoryEnum } from '../../../utils/enums';
import { FileEntity } from './file.entity';

export const fileProviders = [
  {
    provide: CommonRepositoryEnum.FILE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(FileEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
];
