import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  CatalogueActivitiesCodeEnum,
  CatalogueCadastresStateEnum,
  CoreCatalogueTypeEnum,
} from '@modules/core/utils/enums';

import { ConfigEnum } from '@utils/enums';
import { ResponseHttpInterface } from '@utils/interfaces';
import {
  CadastreEntity,
  CadastreStateEntity,
  ProcessEntity,
  ProcessTransportEntity,
  SalesRepresentativeEntity,
  TouristGuideEntity,
} from '@modules/core/entities';
import { CreateRegistrationProcessAgencyDto } from '@modules/core/roles/external/dto/process-agency';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { UserEntity } from '@auth/entities';
import { addDays, endOfDay } from 'date-fns';
import { EmailService } from '@modules/core/shared-core/services/email.service';

@Injectable()
export class ProcessTransportService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly processService: ProcessService,
  ) {}

  async createRegistration(
    payload: CreateRegistrationProcessAgencyDto,
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

      await this.processService.saveRegulation(
        manager,
        payload.processId,
        payload.regulation.regulationResponses,
      );

      await this.saveProcessTransport(payload, manager);

      await this.saveTouristGuides(payload, manager);

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
    payload: CreateRegistrationProcessAgencyDto,
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
    process.hasLandUse = payload.hasLandUse;
    process.registeredAt = new Date();
    process.endedAt = new Date();
    process.isProtectedArea = payload.isProtectedArea;
    process.hasProtectedAreaContract = payload.hasProtectedAreaContract;
    process.inspectionExpirationAt = addDays(endOfDay(new Date()), 114);

    return await processRepository.save(process);
  }

  private async saveProcessTransport(
    payload: CreateRegistrationProcessAgencyDto,
    manager: EntityManager,
  ): Promise<ProcessTransportEntity> {
    const processAgencyRepository = manager.getRepository(ProcessTransportEntity);
    let processAgency = await processAgencyRepository.findOneBy({ processId: payload.processId });

    if (!processAgency) {
      processAgency = processAgencyRepository.create();
    }

    processAgency.processId = payload.processId;
    processAgency.airlineTypeId = payload.permanentPhysicalSpace.id;
    processAgency.certified = true;
    processAgency.certifiedCode = '';
    processAgency.certifiedIssueAt = new Date();
    processAgency.certifiedExpirationAt = new Date();

    return await processAgencyRepository.save(processAgency);
  }

  private async saveTouristGuides(
    payload: CreateRegistrationProcessAgencyDto,
    manager: EntityManager,
  ): Promise<boolean> {
    const touristGuideRepository = manager.getRepository(TouristGuideEntity);

    for (const item of payload.touristGuides) {
      try {
        const touristGuide = touristGuideRepository.create();
        touristGuide.processId = payload.processId;
        touristGuide.isGuide = item.isGuide;
        touristGuide.identification = item.identification;
        touristGuide.name = item.name;

        await touristGuideRepository.save(touristGuide);
      } catch (error: unknown) {
        let errorMessage = 'Error desconocido';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        throw new BadRequestException({
          error: errorMessage,
          message: `Error guardando Guía de Turismo: ${item.name || item.identification}`,
        });
      }
    }

    return true;
  }

  private async saveSalesRepresentatives(
    payload: CreateRegistrationProcessAgencyDto,
    manager: EntityManager,
  ): Promise<boolean> {
    const salesRepresentativeRepository = manager.getRepository(SalesRepresentativeEntity);

    for (const item of payload.salesRepresentatives) {
      try {
        const salesRepresentative = salesRepresentativeRepository.create();
        salesRepresentative.processId = payload.processId;
        salesRepresentative.ruc = item.ruc;
        salesRepresentative.legalName = item.legalName;
        salesRepresentative.hasProfessionalDegree = item.hasProfessionalDegree;
        salesRepresentative.hasContract = item.hasContract;
        salesRepresentative.hasWorkExperience = item.hasWorkExperience;

        await salesRepresentativeRepository.save(salesRepresentative);
      } catch (error: unknown) {
        let errorMessage = 'Error desconocido';

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        throw new BadRequestException({
          error: errorMessage,
          message: `Error guardando Representante de Ventas: ${item.legalName || item.ruc}`,
        });
      }
    }

    return true;
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
        type: CoreCatalogueTypeEnum.cadastres_state,
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
