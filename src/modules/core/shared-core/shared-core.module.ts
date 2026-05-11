import { Global, Module } from '@nestjs/common';
import { controllers } from '@modules/core/shared-core/controllers';
import { coreProviders } from '@modules/core/core.provider';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { CadastreService } from '@modules/core/shared-core/services/cadastre.service';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import { ActivityService } from '@modules/core/shared-core/services/activity.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RegulationSectionService } from '@modules/core/shared-core/services/regulation-section.service';
import { RegulationResponsesService } from '@modules/core/shared-core/services/regulation-responses.service';
import { RoomTypeService } from '@modules/core/shared-core/services/room-type.service';
import { CategoryConfigurationsService } from '@modules/core/shared-core/services/category-configurations.service';
import { GuiaService } from '@modules/core/shared-core/services/guia.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [CacheModule.register(), HttpModule],
  controllers,
  providers: [
    ...coreProviders,
    ActivityService,
    EmailService,
    ProcessService,
    CadastreService,
    RegulationSectionService,
    RegulationResponsesService,
    RoomTypeService,
    CategoryConfigurationsService,
    GuiaService,
  ],
  exports: [ProcessService, EmailService],
})
export class SharedCoreModule {}
