import { Global, Module } from '@nestjs/common';
import { controllers } from '@modules/core/roles/dac/controllers';
import { coreProviders } from '@modules/core/core.provider';
import { CadastreDacService } from '@modules/core/roles/dac/services/cadastre-dac.service';

@Global()
@Module({
  imports: [],
  controllers,
  providers: [...coreProviders, CadastreDacService],
  exports: [CadastreDacService],
})
export class DacModule {}
