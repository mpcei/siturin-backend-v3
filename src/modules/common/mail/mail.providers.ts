import { DataSource } from 'typeorm';
import { CommonRepositoryEnum, ConfigEnum } from '@utils/enums';
import { MailLogEntity } from '@modules/common/mail/mail-log.entity';

export const mailProviders = [
  {
    provide: CommonRepositoryEnum.MAIL_LOG_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MailLogEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
];
