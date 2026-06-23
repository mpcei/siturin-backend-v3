import { Global, Module } from '@nestjs/common';
import { controllers } from '@modules/core/roles/guide-technician/controllers';
import { coreProviders } from '@modules/core/core.provider';
import { GuideTechnicianService } from '@modules/core/roles/guide-technician/services/guide-technician.service';

@Global()
@Module({
  imports: [],
  controllers,
  providers: [...coreProviders, GuideTechnicianService],
  exports: [GuideTechnicianService],
})
export class GuideTechnicianModule {}
