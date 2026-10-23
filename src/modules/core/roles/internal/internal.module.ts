import { Global, Module } from '@nestjs/common';
import { controllers } from '@modules/core/roles/internal/controllers';
import { coreProviders } from '@modules/core/core.provider';
import { InternalService } from './services/internal.service';
import { InternalLegacyService } from './services/internal-legacy.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  controllers,
  providers: [...coreProviders, InternalService, InternalLegacyService],
  exports: [InternalService, InternalLegacyService],
})
export class internalModule {}
