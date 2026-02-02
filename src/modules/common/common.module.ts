import { Global, Module } from '@nestjs/common';
import { CatalogueModule } from '@modules/common/catalogue/catalogue.module';
import { FileModule } from '@modules/common/file/file.module';
import { MailModule } from '@modules/common/mail/mail.module';
import { DpaModule } from '@modules/common/dpa/dpa.module';

@Global()
@Module({
  imports: [CatalogueModule, FileModule, MailModule, DpaModule],
  exports: [CatalogueModule, FileModule, MailModule, DpaModule],
})
export class CommonModule {}
