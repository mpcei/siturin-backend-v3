import { ProcessesController } from './process.controller';
import { CadastreController } from '@modules/core/shared-core/controllers/cadastre.controller';
import { ActivityController } from '@modules/core/shared-core/controllers/activity.controller';
import { RegulationSectionController } from '@modules/core/shared-core/controllers/regulation-section.controller';
import { RoomTypeController } from '@modules/core/shared-core/controllers/room-type.controller';
import { CategoryConfigurationsController } from '@modules/core/shared-core/controllers/category-configurations.controller';

export const controllers = [
  ActivityController,
  ProcessesController,
  CadastreController,
  RegulationSectionController,
  RoomTypeController,
  CategoryConfigurationsController,
];
