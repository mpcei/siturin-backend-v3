import { DataSource } from 'typeorm';
import { ConfigEnum, CommonRepositoryEnum } from '../../../utils/enums';
import { FileEntity } from './file.entity';
import { FileDownloadLogEntity } from '@modules/common/file/file-download-log.entity';

export const fileProviders = [
  {
    provide: CommonRepositoryEnum.FILE_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(FileEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CommonRepositoryEnum.FILE_DOWNLOAD_LOG_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(FileDownloadLogEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
];
