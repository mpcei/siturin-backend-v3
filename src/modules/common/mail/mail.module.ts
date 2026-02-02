import { Global, Module } from '@nestjs/common';
import { FolderPathsService } from '@modules/common/folder-paths.service';
import { MailService } from './mail.service';
import { MailController } from '@modules/common/mail/mail.controller';

@Global()
@Module({
  imports: [],
  controllers: [MailController],
  providers: [MailService, FolderPathsService],
  exports: [MailService],
})
export class MailModule {}
