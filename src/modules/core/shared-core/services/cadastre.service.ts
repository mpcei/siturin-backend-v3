import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ConfigEnum } from '@utils/enums';
import { CatalogueProcessesStateEnum, CoreCatalogueTypeEnum } from '@modules/core/utils/enums';
import { differenceInDays, format, startOfDay } from 'date-fns';
import {
  CadastreEntity,
  CadastreStateEntity,
  InspectionEntity,
  ProcessEntity,
} from '@modules/core/entities';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import {
  CreateDefinitiveSuspensionInspectionStatusDto,
  CreateInactivationInspectionStatusDto,
  CreateRecategorizedInspectionStatusDto,
  CreateReclassifiedInspectionStatusDto,
  CreateRegistrationInspectionStatusDto,
  CreateTemporarySuspensionInspectionStatusDto,
} from '@modules/core/shared-core/dto/cadastre';
import { UserEntity } from '@auth/entities';
import { ProcessService } from '@modules/core/shared-core/services/process.service';

@Injectable()
export class CadastreService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly processService: ProcessService,
  ) {}

  async createRegistrationInspectionStatus(
    payload: CreateRegistrationInspectionStatusDto,
    user: UserEntity,
  ): Promise<CadastreEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const cadastreRepository = manager.getRepository(CadastreEntity);

      let cadastre: CadastreEntity | null = null;

      if (payload.cadastreId) {
        cadastre = await cadastreRepository.findOneBy({ id: payload.cadastreId });
      }

      if (!cadastre) {
        throw new NotFoundException('Catastro no encontrado');
      }

      /* await this.validateInspectionAt(manager, cadastre); */

      await this.saveRatifiedInspectionStatus(manager, cadastre.processId, payload, user.id);

      return cadastre;
    });
  }

  async createReclassifiedInspectionStatus(
    payload: CreateReclassifiedInspectionStatusDto,
    user: UserEntity,
  ): Promise<CadastreEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const cadastreRepository = manager.getRepository(CadastreEntity);

      let cadastre: CadastreEntity | null = null;

      if (payload.cadastreId) {
        cadastre = await cadastreRepository.findOneBy({ id: payload.cadastreId });
      }

      if (!cadastre) {
        throw new NotFoundException('Catastro no encontrado');
      }

      /* await this.validateInspectionAt(manager, cadastre); */

      await this.saveReclassifiedInspectionStatus(manager, cadastre.processId, payload, user.id);

      return cadastre;
    });
  }

  async createRecategorizedInspectionStatus(
    payload: CreateRecategorizedInspectionStatusDto,
    user: UserEntity,
  ): Promise<CadastreEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const cadastreRepository = manager.getRepository(CadastreEntity);

      let cadastre: CadastreEntity | null = null;

      if (payload.cadastreId) {
        cadastre = await cadastreRepository.findOneBy({ id: payload.cadastreId });
      }

      if (!cadastre) {
        throw new NotFoundException('Catastro no encontrado');
      }

      /* await this.validateInspectionAt(manager, cadastre); */

      await this.saveRecategorizedInspectionStatus(manager, cadastre.processId, payload, user.id);

      return cadastre;
    });
  }

  async createTemporarySuspensionInspectionStatus(
    payload: CreateTemporarySuspensionInspectionStatusDto,
    user: UserEntity,
  ): Promise<CadastreEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const cadastreRepository = manager.getRepository(CadastreEntity);

      let cadastre: CadastreEntity | null = null;

      if (payload.cadastreId) {
        cadastre = await cadastreRepository.findOneBy({ id: payload.cadastreId });
      }

      if (!cadastre) {
        throw new NotFoundException('Catastro no encontrado');
      }

      /* await this.validateInspectionAt(manager, cadastre); */

      await this.saveTemporarySuspensionInspectionStatus(
        manager,
        cadastre.processId,
        payload,
        user.id,
      );

      return cadastre;
    });
  }

  async createDefinitiveSuspensionInspectionStatus(
    payload: CreateDefinitiveSuspensionInspectionStatusDto,
    user: UserEntity,
  ): Promise<CadastreEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const cadastreRepository = manager.getRepository(CadastreEntity);

      let cadastre: CadastreEntity | null = null;

      if (payload.cadastreId) {
        cadastre = await cadastreRepository.findOneBy({ id: payload.cadastreId });
      }

      if (!cadastre) {
        throw new NotFoundException('Catastro no encontrado');
      }

      // await this.validateInspectionAt(manager, cadastre);

      await this.saveDefinitiveSuspensionInspectionStatus(
        manager,
        cadastre.processId,
        payload,
        user.id,
      );

      return cadastre;
    });
  }

  async createInactivationInspectionStatus(
    payload: CreateInactivationInspectionStatusDto,
    user: UserEntity,
  ): Promise<CadastreEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const cadastreRepository = manager.getRepository(CadastreEntity);

      let cadastre: CadastreEntity | null = null;

      if (payload.cadastreId) {
        cadastre = await cadastreRepository.findOneBy({ id: payload.cadastreId });
      }

      if (!cadastre) {
        throw new NotFoundException('Catastro no encontrado');
      }

      // await this.validateInspectionAt(manager, cadastre);

      await this.saveInactivationInspectionStatus(manager, cadastre.processId, payload, user.id);

      return cadastre;
    });
  }

  private async validateInspectionAt(
    manager: EntityManager,
    cadastre: CadastreEntity,
  ): Promise<void> {
    const processRepository = manager.getRepository(ProcessEntity);
    const inspectionRepository = manager.getRepository(InspectionEntity);
    const actualInspection = await inspectionRepository.findOne({
      where: { processId: cadastre.processId, isCurrent: true },
    });

    if (!actualInspection) {
      throw new NotFoundException('Inspección no encontrada');
    }

    if (differenceInDays(startOfDay(actualInspection.inspectionAt), startOfDay(new Date())) > 0) {
      throw new BadRequestException({
        error: 'No se puede cambiar el estado',
        message: `La fecha de inspección (${format(actualInspection.inspectionAt, 'yyyy-MM-dd')}) es mayor a la actual`,
      });
    }

    const process = await processRepository.findOneBy({ id: cadastre.processId });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    if (differenceInDays(startOfDay(process.inspectionExpirationAt), startOfDay(new Date())) < 0) {
      throw new BadRequestException({
        error: 'No se puede cambiar el estado',
        message: `La fecha límite fue el ${format(process.inspectionExpirationAt, 'yyyy-MM-dd')}`,
      });
    }
  }

  private async saveRatifiedInspectionStatus(
    manager: EntityManager,
    processId: string,
    payload: CreateRegistrationInspectionStatusDto,
    userId: string,
  ): Promise<void> {
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOneBy({ id: processId });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const processState = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.completed,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    process.attendedAt = new Date();

    if (processState) process.stateId = processState.id;

    await this.saveCadastreState(manager, payload.cadastreId, payload.state.id, userId);

    await processRepository.save(process);
  }

  private async saveReclassifiedInspectionStatus(
    manager: EntityManager,
    processId: string,
    payload: CreateReclassifiedInspectionStatusDto,
    userId: string,
  ): Promise<void> {
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOneBy({ id: processId });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const processState = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.completed,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    process.attendedAt = new Date();
    process.classificationId = payload.classification.id;
    process.categoryId = payload.category.id;

    if (processState) process.stateId = processState.id;

    await this.saveCadastreState(manager, payload.cadastreId, payload.state.id, userId);

    await processRepository.save(process);
  }

  private async saveRecategorizedInspectionStatus(
    manager: EntityManager,
    processId: string,
    payload: CreateRecategorizedInspectionStatusDto,
    userId: string,
  ): Promise<void> {
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOneBy({ id: processId });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const processState = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.completed,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    process.attendedAt = new Date();
    process.categoryId = payload.category.id;

    if (processState) process.stateId = processState.id;

    await this.saveCadastreState(manager, payload.cadastreId, payload.state.id, userId);

    await processRepository.save(process);
  }

  private async saveTemporarySuspensionInspectionStatus(
    manager: EntityManager,
    processId: string,
    payload: CreateTemporarySuspensionInspectionStatusDto,
    userId: string,
  ): Promise<void> {
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOneBy({ id: processId });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    await this.processService.saveAutoInspection2(manager, processId, userId);

    await this.processService.saveBreachCauses(manager, processId, payload.breachCauses);

    const processState = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.pending_2,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    process.attendedAt = new Date();

    if (processState) process.stateId = processState.id;

    await this.saveCadastreState(manager, payload.cadastreId, payload.state.id, userId);

    await processRepository.save(process);
  }

  private async saveDefinitiveSuspensionInspectionStatus(
    manager: EntityManager,
    processId: string,
    payload: CreateDefinitiveSuspensionInspectionStatusDto,
    userId: string,
  ): Promise<void> {
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOneBy({ id: processId });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const processState = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.completed,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    process.attendedAt = new Date();

    if (processState) process.stateId = processState.id;

    await this.saveCadastreState(manager, payload.cadastreId, payload.state.id, userId);

    await processRepository.save(process);
  }

  private async saveInactivationInspectionStatus(
    manager: EntityManager,
    processId: string,
    payload: CreateInactivationInspectionStatusDto,
    userId: string,
  ): Promise<void> {
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOneBy({ id: processId });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    await this.processService.saveInactivationCauses(
      manager,
      processId,
      payload.inactivationCauses,
    );

    const processState = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.completed,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    process.attendedAt = new Date();
    process.inactivationCauseTypeId = payload.inactivationCauseType.id;

    if (processState) process.stateId = processState.id;

    await this.saveCadastreState(manager, payload.cadastreId, payload.state.id, userId);

    await processRepository.save(process);
  }

  private async saveCadastreState(
    manager: EntityManager,
    cadastreId: string,
    stateId: string,
    userId: string,
  ): Promise<void> {
    const cadastreStateRepository = manager.getRepository(CadastreStateEntity);

    await cadastreStateRepository
      .createQueryBuilder()
      .update(CadastreStateEntity)
      .set({ isCurrent: false })
      .where('cadastre_id = :cadastreId', { cadastreId })
      .execute();

    let cadastreState = await cadastreStateRepository.findOne({
      where: { cadastreId, isCurrent: true },
    });

    if (!cadastreState) {
      cadastreState = cadastreStateRepository.create();
    }

    cadastreState.cadastreId = cadastreId;
    cadastreState.isCurrent = true;
    cadastreState.stateId = stateId;
    cadastreState.userId = userId;

    await cadastreStateRepository.save(cadastreState);
  }
}
