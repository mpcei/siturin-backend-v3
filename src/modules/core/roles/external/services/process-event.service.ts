import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CatalogueActivitiesCodeEnum,
  CatalogueCadastresStateEnum,
  CoreCatalogueTypeEnum,
} from '@modules/core/utils/enums';

import { ConfigEnum } from '@utils/enums';

import { DataSource, EntityManager } from 'typeorm';
import { UserEntity } from '@auth/entities';
import { ResponseHttpInterface } from '@utils/interfaces';
import {
  CadastreEntity,
  CadastreStateEntity,
  ProcessEntity,
  ProcessEventEntity,
} from '@modules/core/entities';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import { addDays, endOfDay } from 'date-fns';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { CreateRegistrationProcessEventDto } from '../dto/process-event';

@Injectable()
export class ProcessEventService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly processService: ProcessService,
  ) {}

  async createRegistration(
    payload: CreateRegistrationProcessEventDto,
    user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const process = await this.saveProcess(payload, manager);

      await this.processService.saveAutoInspection(manager, user, payload.processId, payload.type);

      await this.processService.saveAutoAssignment(
        manager,
        payload.processId,
        process.establishmentAddress.provinceId,
      );

      await this.saveProcessEvent(payload, manager);

      const cadastre = await this.saveCadastre(payload.processId, manager);

      const responseSendEmail = await this.emailService.sendRegistrationCertificateEmail(cadastre);

      if (responseSendEmail) {
        return {
          data: cadastre,
          title: responseSendEmail.title,
          message: responseSendEmail.message,
        };
      }

      return {
        data: cadastre,
        title:
          'El certificado de registro de turismo ha sido enviado a la cuenta de correo electrónico registrado y en la plataforma SITURIN.',
        message:
          'Recuerde que puede solicitar la primera inspección antes de los 84 días calendario, contados a partir de la emisión del certificado de registro.',
      };
    });
  }

  private async saveProcess(
    payload: CreateRegistrationProcessEventDto,
    manager: EntityManager,
  ): Promise<ProcessEntity> {
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOne({
      where: { id: payload.processId },
      relations: { establishmentAddress: true },
    });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const state = await catalogueRepository.findOneBy({
      code: 'pendiente_inspeccion_1',
      type: 'tramite_estados',
    });

    if (state) process.stateId = state.id;

    process.activityId = payload.activity.id;
    process.classificationId = payload.classification.id;
    process.categoryId = payload.category.id;
    process.registeredAt = new Date();
    process.endedAt = new Date();
    process.isProtectedArea = payload.isProtectedArea;
    process.hasProtectedAreaContract = payload.hasProtectedAreaContract;
    process.inspectionExpirationAt = addDays(endOfDay(new Date()), 114);

    return await processRepository.save(process);
  }

  private async saveProcessEvent(
    payload: CreateRegistrationProcessEventDto,
    manager: EntityManager,
  ): Promise<ProcessEventEntity> {
    const processEventRepository = manager.getRepository(ProcessEventEntity);

    let processEvent = await processEventRepository.findOneBy({
      processId: payload.processId,
    });

    if (!processEvent) {
      processEvent = processEventRepository.create();
    }

    processEvent.processId = payload.processId;
    processEvent.totalCapacities = payload.totalCapacities;

    return await processEventRepository.save(processEvent);
  }

  private async saveCadastre(processId: string, manager: EntityManager): Promise<CadastreEntity> {
    const cadastreRepository = manager.getRepository(CadastreEntity);
    const cadastreStateRepository = manager.getRepository(CadastreStateEntity);
    const processRepository = manager.getRepository(ProcessEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const process = await processRepository.findOne({
      where: { id: processId },
      relations: { activity: true, establishment: { ruc: true }, establishmentAddress: true },
    });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const state = await catalogueRepository.findOne({
      where: {
        code: CatalogueCadastresStateEnum.pending,
        type: CoreCatalogueTypeEnum.cadastres_state,
      },
    });

    const establishmentNumber = process.establishment.number.padStart(3, '0');

    const cadastreLast = await cadastreRepository
      .createQueryBuilder('cadastres')
      .innerJoin('cadastres.process', 'processes')
      .innerJoin('processes.activity', 'activities')
      .where('activities.code IN (:...activityCodes)', {
        activityCodes: [
          CatalogueActivitiesCodeEnum.event_continent,
          CatalogueActivitiesCodeEnum.event_galapagos,
        ],
      })
      .orderBy('processes.id', 'ASC')
      .addOrderBy('SUBSTRING(cadastres.register_number, 20)', 'DESC')
      .getOne();

    // review consultar que secuencial corresponde
    const init = '2';
    let sequential = '1';

    if (cadastreLast) {
      sequential = (parseInt(cadastreLast.registerNumber.substring(20)) + 1).toString();
    }

    sequential = `${init}${sequential.padStart(6, '0')}`;

    let cadastre = await cadastreRepository.findOneBy({ processId: process.id });

    if (!cadastre) {
      cadastre = cadastreRepository.create();
    }

    cadastre.processId = process.id;
    cadastre.registerNumber = `${process.establishment.ruc.number}.${establishmentNumber}.${sequential}`;
    cadastre.registeredAt = new Date();
    cadastre.systemOrigin = 'SITURIN V3';

    cadastre = await cadastreRepository.save(cadastre);

    let cadastreState = await cadastreStateRepository.findOneBy({ cadastreId: cadastre.id });
    if (!cadastreState) {
      cadastreState = cadastreStateRepository.create();
      cadastreState.cadastreId = cadastre.id;
      cadastreState.isCurrent = true;

      if (state) cadastreState.stateId = state.id;

      await cadastreStateRepository.save(cadastreState);
    }

    return cadastre;
  }
}
