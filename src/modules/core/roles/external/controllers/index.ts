import { ProcessTransportController } from './process-transport.controller';
import { CadastreController } from './cadastre.controller';
import { ProcessAgencyController } from '@modules/core/roles/external/controllers/process-agency.controller';
import { EstablishmentController } from '@modules/core/roles/external/controllers/establishment.controller';
import { ProcessParkController } from '@modules/core/roles/external/controllers/process-park.controller';
import { ProcessCtcController } from '@modules/core/roles/external/controllers/ctc.controller';
import { ProcessEventController } from '@modules/core/roles/external/controllers/process-event.controller';
import { ProcessFoodDrinkController } from '@modules/core/roles/external/controllers/process-food-drink.controller';

export const controllers = [
  CadastreController,
  EstablishmentController,
  ProcessAgencyController,
  ProcessTransportController,
  ProcessParkController,
  ProcessCtcController,
  ProcessEventController,
  ProcessFoodDrinkController,
];
