import { Global, Module } from '@nestjs/common';
import { MigrationService } from '@modules/migration/migration.service';
import { MigrationController } from '@modules/migration/migration.controller';
import { coreProviders } from '@modules/core/core.provider';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [MigrationController],
  providers: [...coreProviders, MigrationService],
})
export class MigrationModule {}
