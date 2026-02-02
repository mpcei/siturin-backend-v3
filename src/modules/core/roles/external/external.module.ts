import { Global, Module } from '@nestjs/common';
import { CatalogueModule } from '@modules/common/catalogue/catalogue.module';
import { FileModule } from '@modules/common/file/file.module';
import { MailModule } from '@modules/common/mail/mail.module';
import { controllers } from '@modules/core/roles/external/controllers';
import { coreProviders } from '@modules/core/core.provider';
import { CadastreService } from '@modules/core/roles/external/services/cadastre.service';
import { ProcessAgencyService } from '@modules/core/roles/external/services/process-agency.service';
import { SharedCoreModule } from '@modules/core/shared-core/shared-core.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { EstablishmentService } from '@modules/core/roles/external/services/establishment.service';
import { ProcessParkService } from '@modules/core/roles/external/services/process-park.service';
import { ProcessCtcService } from '@modules/core/roles/external/services/process-ctc.service';
import { ProcessEventService } from '@modules/core/roles/external/services/process-event.service';
import { ProcessFoodDrinkService } from '@modules/core/roles/external/services/process-food-drink.service';
import { ProcessTransportService } from '@modules/core/roles/external/services/process-transport.service';

@Global()
@Module({
  imports: [CatalogueModule, FileModule, MailModule, SharedCoreModule, ReportsModule],
  controllers,
  providers: [
    ...coreProviders,
    CadastreService,
    EstablishmentService,
    ProcessAgencyService,
    ProcessParkService,
    ProcessCtcService,
    ProcessEventService,
    ProcessFoodDrinkService,
    ProcessTransportService,
  ],
  exports: [],
})
export class ExternalModule {}
