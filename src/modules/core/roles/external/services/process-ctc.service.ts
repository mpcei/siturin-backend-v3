import { UserEntity } from '@auth/entities';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CatalogueActivitiesCodeEnum,
  CatalogueCadastresStateEnum,
  CatalogueTypeEnum,
} from '@modules/core/utils/enums';
import { ConfigEnum } from '@utils/enums';

import { ResponseHttpInterface } from '@utils/interfaces';
import { DataSource, EntityManager } from 'typeorm';
import { CreateRegistrationProcessCtcDto } from '@modules/core/roles/external/dto/process-ctc/create-registration-process-ctc.dto';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import {
  CadastreEntity,
  CadastreStateEntity,
  CtcActivityEntity,
  ProcessCtcEntity,
  ProcessEntity,
} from '@modules/core/entities';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { addDays, endOfDay } from 'date-fns';

@Injectable()
export class ProcessCtcService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly processService: ProcessService,
  ) {}

  async createRegistration(
    payload: CreateRegistrationProcessCtcDto,
    user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const process = await this.saveProcess(payload, manager);

      await this.saveProcessCtc(payload, manager);

      await this.saveCtcActivities(payload, manager);

      if (
        payload.communityOperation &&
        payload.communityOperation.adventureTourismModalities &&
        payload.communityOperation.adventureTourismModalities.length > 0
      ) {
        await this.processService.saveAdventureTourismModalities(
          payload.processId,
          payload.communityOperation.adventureTourismModalities,
          manager,
        );
      }

      if (
        payload.communityOperation &&
        payload.communityOperation.touristGuides &&
        payload.communityOperation.touristGuides.length > 0
      ) {
        const touristGuides = await this.processService.saveTouristGuides(
          payload.processId,
          payload.communityOperation.touristGuides,
          manager,
        );
      }

      if (payload.touristTransport.hasTransports) {
        const touristTransport = await this.processService.saveTouristTransportCompanies(
          payload.processId,
          payload.touristTransport.touristTransportCompanies,
          manager,
        );
      }

      if (payload.accommodation) {
        const accommodation = await this.saveAccommodation(payload, manager);
      }

      if (payload.foodDrink) {
        const food = await this.saveFood(payload, manager);
      }

      await this.processService.saveAutoInspection(manager, user, payload.processId, payload.type);

      const autoAssignment = await this.processService.saveAutoAssignment(
        manager,
        payload.processId,
        process.establishmentAddress.provinceId,
      );

      await this.processService.saveRegulation(
        manager,
        payload.processId,
        payload.regulation.regulationResponses,
      );

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
          'El certificado de registro de turismo ha sido enviado a la cuenta de correo electrónico registrado y en la plataforma SITURIN, en la sección de descargas.',
        message:
          'Recuerde que puede solicitar la primera inspección, ingresando al sistema SITURIN antes de los 84 días calendario, contados a partir de la emisión del certificado de registro',
      };
    });
  }

  private async saveProcess(
    payload: CreateRegistrationProcessCtcDto,
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

    // review agregar enum para code y type
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
    process.inspectionExpirationAt = addDays(endOfDay(new Date()), 114);

    return await processRepository.save(process);
  }

  private async saveCtcActivities(
    payload: CreateRegistrationProcessCtcDto,
    manager: EntityManager,
  ): Promise<void> {
    const ctcActivityRepository = manager.getRepository(CtcActivityEntity);

    if (payload.activities && payload.activities.length > 0) {
      for (const activity of payload.activities) {
        const ctcActivity = ctcActivityRepository.create();
        ctcActivity.processId = payload.processId;
        ctcActivity.activityId = activity.id;
        ctcActivity.enabled = true;
        await ctcActivityRepository.save(ctcActivity);
      }
    }
  }

  private async saveProcessCtc(
    payload: CreateRegistrationProcessCtcDto,
    manager: EntityManager,
  ): Promise<ProcessCtcEntity> {
    const processCtcRepository = manager.getRepository(ProcessCtcEntity);
    let processCtc = await processCtcRepository.findOneBy({ processId: payload.processId });

    if (!processCtc) {
      processCtc = processCtcRepository.create();
    }

    processCtc.processId = payload.processId;
    processCtc.hasPropertyRegistrationCertificate = payload.hasPropertyRegistrationCertificate;
    processCtc.hasTechnicalReport = payload.hasTechnicalReport;
    processCtc.hasStatute = payload.hasStatute;
    try {
      const savedProcessCtc = await processCtcRepository.save(processCtc);
      return savedProcessCtc;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al guardar el proceso CTC');
    }
  }

  private async saveAccommodation(
    payload: CreateRegistrationProcessCtcDto,
    manager: EntityManager,
  ): Promise<ProcessCtcEntity> {
    const processCtcRepository = manager.getRepository(ProcessCtcEntity);
    let processCtc = await processCtcRepository.findOneBy({ processId: payload.processId });

    if (!processCtc) {
      processCtc = processCtcRepository.create();
    }

    processCtc.processId = payload.processId;
    processCtc.totalBeds = payload.accommodation.totalBeds;
    processCtc.totalPlaces = payload.accommodation.totalPlaces;
    processCtc.totalRooms = payload.accommodation.totalRooms;

    return await processCtcRepository.save(processCtc);
  }

  private async saveFood(
    payload: CreateRegistrationProcessCtcDto,
    manager: EntityManager,
  ): Promise<ProcessCtcEntity> {
    const processCtcRepository = manager.getRepository(ProcessCtcEntity);
    let processCtc = await processCtcRepository.findOneBy({ processId: payload.processId });

    if (!processCtc) {
      processCtc = processCtcRepository.create();
    }

    processCtc.processId = payload.processId;
    processCtc.totalCapacities = payload.foodDrink.totalCapacities;
    processCtc.totalTables = payload.foodDrink.totalTables;

    return await processCtcRepository.save(processCtc);
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

    const state = await catalogueRepository.findOne({
      where: {
        code: CatalogueCadastresStateEnum.pending,
        type: CatalogueTypeEnum.cadastres_state,
      },
    });

    if (!process) {
      throw new NotFoundException('Trámite no encontrado');
    }

    const establishmentNumber = process?.establishment.number.padStart(3, '0');

    const cadastreLast = await cadastreRepository
      .createQueryBuilder('cadastres')
      .innerJoin('cadastres.process', 'processes')
      .innerJoin('processes.activity', 'activities')
      .where('activities.code IN (:...activityCodes)', {
        activityCodes: [
          CatalogueActivitiesCodeEnum.agency_continent,
          CatalogueActivitiesCodeEnum.agency_galapagos,
        ],
      })
      .orderBy('processes.id', 'ASC')
      .addOrderBy('SUBSTRING(cadastres.register_number, 20)', 'DESC')
      .getOne();

    let sequential = '1';

    if (cadastreLast) {
      sequential = (parseInt(cadastreLast.registerNumber.substring(20)) + 1).toString();
    }

    sequential = `4${sequential.padStart(6, '0')}`;
    let cadastre = await cadastreRepository.findOneBy({ processId: process.id });

    if (!cadastre) {
      cadastre = cadastreRepository.create();
    }

    cadastre.processId = process.id;
    cadastre.registerNumber = `${process?.establishment.ruc.number}.${establishmentNumber}.${sequential}`;
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
