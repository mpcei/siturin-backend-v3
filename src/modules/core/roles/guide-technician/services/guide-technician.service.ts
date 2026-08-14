import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  Between,
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';
import {
  CatalogueActivitiesCodeEnum,
  CatalogueCadastresStateEnum,
  CatalogueCredentialsStateEnum,
  CatalogueInactivationCauseCodeEnum,
  CatalogueProcessesStateEnum,
  CatalogueProcessesTypeEnum,
  CoreCatalogueTypeEnum,
  CoreRepositoryEnum,
  OriginSystemEnum,
} from '@modules/core/utils/enums';
import { ResponseHttpInterface, ServiceResponseHttpInterface } from '@utils/interfaces';
import {
  AssignmentEntity,
  CadastreEntity,
  CadastreStateEntity,
  InactivationCauseEntity,
  InternalDpaUserEntity,
  InternalUserEntity,
  ProcessEntity,
} from '@modules/core/entities';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';
import { FileEntity } from '@modules/common/file/file.entity';
import { UserEntity } from '@auth/entities';
import { InactivationDto } from '@modules/core/roles/external/dto/process-guide/inactivation.dto';
import { ConfigEnum } from '@utils/enums';
import { ProcessStateEntity } from '@modules/core/entities/process-state.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { CredentialEntity } from '@modules/core/entities/credential.entity';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import { CataloguesService } from '@modules/common/catalogue/catalogue.service';
import { RoleEnum } from '@auth/enums';
import { DocumentReviewDto } from '@modules/core/roles/guide-technician/dto/guide-technician';
import { ProcessGuideEntity } from '@modules/core/entities/process-guide.entity';
import { FindProcessesDto } from '@modules/core/roles/guide-technician/dto/guide-technician/find-processes.dto';
import { LanguageEntity } from '@modules/core/entities/language.entity';
import { AdventureModalityEntity } from '@modules/core/entities/adventure-modality.entity';
import { ProtectedAreaEntity } from '@modules/core/entities/protected-area.entity';
import { PaginationDto } from '@utils/pagination';
import { endOfDay, parseISO, startOfDay } from 'date-fns';

interface InternalUserRole {
  availableInternalUser: InternalUserEntity | null;
  rolCode: string;
}

@Injectable()
export class GuideTechnicianService {
  private paginateFilterService: PaginateFilterService<CadastreEntity>;

  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly cataloguesService: CataloguesService,

    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private processRepository: Repository<ProcessEntity>,
    @Inject(CoreRepositoryEnum.ASSIGNMENT_REPOSITORY)
    private assignmentRepository: Repository<AssignmentEntity>,
    @Inject(CoreRepositoryEnum.INTERNAL_USER_REPOSITORY)
    private readonly internalUserRepository: Repository<InternalUserEntity>,
    @Inject(CoreRepositoryEnum.INTERNAL_DPA_USER_REPOSITORY)
    private readonly internalDpaUserRepository: Repository<InternalDpaUserEntity>,
    @Inject(CoreRepositoryEnum.CADASTRE_REPOSITORY)
    private readonly cadastreRepository: Repository<CadastreEntity>,
    private readonly emailService: EmailService,
  ) {}

  async findProcessesByUser(
    user: UserEntity,
    params: FindProcessesDto,
  ): Promise<ServiceResponseHttpInterface> {
    const {
      registerNumber,
      establishmentNumber,
      legalName,
      province,
      canton,
      parish,
      classification,
      processType,
      cadastreState,
      startedAt,
      endedAt,
    } = params;

    const where: FindOptionsWhere<AssignmentEntity> = {};

    if (registerNumber) {
      where.process = { cadastre: { registerNumber: ILike(`%${registerNumber}%`) } };
    }
    if (establishmentNumber) {
      where.process = { establishment: { number: ILike(`%${establishmentNumber}%`) } };
    }
    if (legalName) {
      where.process = { establishment: { ruc: { legalName: ILike(`%${legalName}%`) } } };
    }
    if (province) {
      where.process = { establishment: { province: { name: ILike(`%${province}%`) } } };
    }
    if (canton) {
      where.process = { establishment: { canton: { name: ILike(`%${canton}%`) } } };
    }
    if (parish) {
      where.process = { establishment: { parish: { name: ILike(`%${parish}%`) } } };
    }
    if (classification) {
      where.process = { credentials: { classification: { name: ILike(`%${classification}%`) } } };
    }
    if (processType) {
      where.process = { type: { name: ILike(`%${processType}%`) } };
    }
    if (cadastreState) {
      where.process = { cadastre: { state: { name: ILike(`%${cadastreState}%`) } } };
    }
    if (startedAt && endedAt) {
      const startedAtParse = parseISO(startedAt);
      const endedAtProcessParse = parseISO(endedAt);
      const initDate = startOfDay(startedAtParse);
      const finishDate = endOfDay(endedAtProcessParse);
      where.process = { registeredAt: Between(initDate, finishDate) };
    }

    const response = await this.assignmentRepository.findAndCount({
      where: {
        rolCode: params.rolCode,
        internalUser: { userId: user.id },
        isCurrent: params.isCurrent,
        enabled: true,
        ...where,
      },
      relations: {
        process: {
          cadastre: { state: true },
          type: true,
          state: true,
          establishment: {
            ruc: true,
            establishmentContactPerson: true,
            credentials: { classification: true },
            province: true,
            canton: true,
            parish: true,
          },
          credentials: { classification: true },
        },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      data: response[0],
      pagination: { limit: params.limit, totalItems: response[1] },
    };
  }

  async findProcessById(
    user: UserEntity,
    processId: string,
    rolCode: string,
    isCurrent: boolean,
  ): Promise<ResponseHttpInterface> {
    if (isCurrent) {
      const find = await this.dataSource.transaction(async (manager) => {
        return await this.saveProcessState(manager, processId, user, rolCode);
      });

      if (!find) {
        throw new BadRequestException({
          message: 'Trámite en estado diferente al requerido',
          error: 'Estado Trámite',
        });
      }
    }

    const process = await this.processRepository
      .createQueryBuilder('process')

      // Credentials
      .leftJoinAndSelect('process.credentials', 'credential')
      .leftJoinAndSelect('credential.classification', 'classification')
      .leftJoinAndSelect('credential.geographicArea', 'geographicArea')
      .leftJoinAndSelect('credential.category', 'category')

      // Process Guide
      .leftJoinAndSelect('process.processGuides', 'processGuide')
      .leftJoinAndSelect('processGuide.requirement', 'requirement')

      // Archivo polimórfico
      .leftJoinAndMapOne('processGuide.file', FileEntity, 'file', 'file.modelId = processGuide.id')

      // Process States
      .leftJoinAndSelect('process.processStates', 'processStates')

      // Establishment
      .leftJoinAndSelect('process.establishment', 'establishment')
      .leftJoinAndSelect('establishment.establishmentContactPerson', 'establishmentContactPerson')
      .leftJoinAndSelect('establishment.establishmentAddress', 'establishmentAddress')
      .leftJoinAndSelect('establishmentAddress.province', 'province')
      .leftJoinAndSelect('establishmentAddress.canton', 'canton')
      .leftJoinAndSelect('establishmentAddress.parish', 'parish')
      .leftJoinAndSelect('establishment.adventureModalities', 'adventureModalities')
      .leftJoinAndSelect('establishment.languages', 'languages')
      .leftJoinAndSelect('establishment.protectedAreas', 'protectedAreas')
      .leftJoinAndSelect('establishment.ruc', 'ruc')

      //User
      .leftJoinAndSelect('ruc.user', 'user')
      .leftJoinAndSelect('user.bloodType', 'bloodType')
      .leftJoinAndSelect('user.sex', 'sex')
      .leftJoinAndSelect('user.nationality', 'nationality')

      // Land Transport
      .leftJoinAndSelect('process.landTransport', 'landTransport')

      .where('process.id = :id', { id: processId })

      .getOne();

    const lastAssigment = await this.assignmentRepository.findOne({
      where: { processId, rolCode: RoleEnum.GUIDE_TECHNICIAN },
      order: { createdAt: 'desc' },
    });

    return {
      data: { ...process, lastAssigment },
      title: 'Busqueda exitosa',
      message: '',
    };
  }

  private async saveProcessState(
    manager: EntityManager,
    processId: string,
    user: UserEntity,
    rolCode: string,
  ): Promise<boolean> {
    const processRepository = manager.getRepository(ProcessEntity);
    const processStateRepository = manager.getRepository(ProcessStateEntity);

    const processStateInProcess = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueProcessesStateEnum.in_progress &&
        item.type === CoreCatalogueTypeEnum.processes_state,
    );

    const processStateInReview = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueProcessesStateEnum.in_review &&
        item.type === CoreCatalogueTypeEnum.processes_state,
    );

    const processStateInApproval = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueProcessesStateEnum.in_approval &&
        item.type === CoreCatalogueTypeEnum.processes_state,
    );

    const processStateReviewed = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueProcessesStateEnum.reviewed &&
        item.type === CoreCatalogueTypeEnum.processes_state,
    );

    if (
      !processStateInProcess ||
      !processStateInReview ||
      !processStateInApproval ||
      !processStateReviewed
    ) {
      throw new NotFoundException({
        message: 'No existen todos los estados del trámite configurados.',
        error: 'Estado del Trámite',
      });
    }

    const process = await processRepository.findOne({
      where: { id: processId },
      relations: { state: true },
    });

    if (!process) {
      throw new NotFoundException({
        message: 'No existe el Proceso',
        error: 'Proceso',
      });
    }

    let currentState: CatalogueEntity | null = null;
    let nextState: CatalogueEntity | null = null;

    switch (rolCode) {
      case RoleEnum.GUIDE_TECHNICIAN: {
        currentState = processStateInProcess;
        nextState = processStateInReview;
        if (process.state.code !== currentState.code) {
          return process.state.code === nextState.code;
        }

        break;
      }
      case RoleEnum.DIRECTOR: {
        currentState = processStateReviewed;
        nextState = processStateInApproval;
        if (process.state.code !== currentState.code) {
          return process.state.code === nextState.code;
        }

        break;
      }
    }
    if (!nextState) {
      throw new NotFoundException({
        error: '',
        message: '',
      });
    }
    process.state = nextState;
    await processRepository.save(process);

    const processStateCurrent = await processStateRepository.findOne({
      where: { processId: process.id, endedAt: IsNull() },
    });
    if (processStateCurrent) {
      processStateCurrent.endedAt = new Date();
      await processStateRepository.save(processStateCurrent);
    }

    await processStateRepository.save(
      processStateRepository.create({
        processId,
        startedAt: new Date(),
        userId: user.id,
        stateCode: nextState.code,
        stateName: nextState.name,
      }),
    );

    return true;
  }

  async saveResultProcessTechnician(
    payload: DocumentReviewDto,
    user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const { process, assignment } = await this.dataSource.transaction(async (manager) => {
      const process = await this.saveState(manager, payload, user);
      await this.saveResultTechnician(manager, payload.processGuides, process);
      const assignment = await this.saveAssignment(manager, payload, process);

      return { process, assignment };
    });

    if (!process) {
      throw new Error();
    }
    let responseSendEmail:
      | {
          title: string;
          message: string[];
        }
      | undefined = undefined;
    if (process.state.code === CatalogueProcessesStateEnum.reviewed) {
      responseSendEmail = await this.emailService.sendDirectorReviewedEmail(process, assignment);
    } else {
      responseSendEmail = await this.emailService.sendExternalDocumentRejectedEmail(
        process,
        payload.observation,
      );
    }

    if (responseSendEmail) {
      return {
        data: null,
        title: responseSendEmail.title,
        message: responseSendEmail.message,
      };
    }
    return {
      data: null,
      title: 'Resultado guardado de manera exitosa',
      message: 'Recuerde revisar su correo electronico de manera permanente',
    };
  }

  private async saveState(
    manager: EntityManager,
    payload: DocumentReviewDto,
    user: UserEntity,
  ): Promise<ProcessEntity> {
    const processStateRepository = manager.getRepository(ProcessStateEntity);
    const processRepository = manager.getRepository(ProcessEntity);

    const processStateCurrent = await processStateRepository.findOne({
      where: { processId: payload.processId, endedAt: IsNull() },
    });
    if (processStateCurrent) {
      processStateCurrent.endedAt = new Date();
      await processStateRepository.save(processStateCurrent);
    }

    await processStateRepository.save(
      processStateRepository.create({
        processId: payload.processId,
        startedAt: new Date(),
        userId: user.id,
        stateCode: payload.processState.code,
        stateName: payload.processState.name,
      }),
    );

    const process = await processRepository.findOne({
      where: { id: payload.processId },
      relations: {
        state: true,
        establishment: { establishmentAddress: true, ruc: true, establishmentContactPerson: true },
        type: true,
        credentials: { classification: true },
      },
    });

    if (!process) {
      throw new NotFoundException({
        message: 'No existe el Proceso',
        error: 'Proceso',
      });
    }

    process.state = payload.processState;

    return await processRepository.save(process);
  }

  private async saveResultTechnician(
    manager: EntityManager,
    processGuides: ProcessGuideEntity[],
    process: ProcessEntity,
  ): Promise<boolean> {
    const processGuideRepository = manager.getRepository(ProcessGuideEntity);
    const languageRepository = manager.getRepository(LanguageEntity);
    const modalityRepository = manager.getRepository(AdventureModalityEntity);
    const protectedAreaRepository = manager.getRepository(ProtectedAreaEntity);
    const credentialRepository = manager.getRepository(CredentialEntity);

    const languages = await languageRepository.find({ where: { processId: process.id } });
    const modalities = await modalityRepository.find({ where: { processId: process.id } });
    const areas = await protectedAreaRepository.find({ where: { processId: process.id } });
    const credentials = await credentialRepository.find({ where: { processId: process.id } });

    const credentialStateRejected = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueCredentialsStateEnum.rejected &&
        item.type === CoreCatalogueTypeEnum.credentials_state,
    );

    if (!credentialStateRejected) {
      throw new NotFoundException({
        message: 'No existen todos los estados de las credenciales configurados.',
        error: 'Estado de la Credencial',
      });
    }

    await processGuideRepository.save(processGuides);

    if (process.state.code === CatalogueProcessesStateEnum.document_rejected) {
      for (const language of languages) {
        await languageRepository.softRemove(language);
      }

      for (const modality of modalities) {
        await modalityRepository.softRemove(modality);
      }

      for (const area of areas) {
        await protectedAreaRepository.softRemove(area);
      }

      for (const credential of credentials) {
        const { id, createdAt, updatedAt, ...credentialClone } = credential;

        const credentialNew = credentialRepository.create(credentialClone);

        credentialNew.stateCode = credentialStateRejected.code;
        credentialNew.stateName = credentialStateRejected.name;

        await credentialRepository.save(credentialNew);
        await credentialRepository.softRemove(credential);
      }
    }

    return true;
  }

  async saveAssignment(manager: EntityManager, payload: DocumentReviewDto, process: ProcessEntity) {
    const assignmentRepository = manager.getRepository(AssignmentEntity);

    const assignment = await assignmentRepository.findOne({
      where: { id: payload.assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException({
        message: 'No existe la asignación del Tramite',
        error: 'Asignación',
      });
    }

    if (payload.processState.code === CatalogueProcessesStateEnum.reviewed) {
      const assignmentNew = assignmentRepository.create();
      assignmentNew.processId = payload.processId;
      assignmentNew.isCurrent = true;
      assignmentNew.registeredAt = new Date();
      assignmentNew.dpaId = process.establishment.establishmentAddress.provinceId;
      assignmentNew.observation = payload.observation;

      const { availableInternalUser, rolCode } = await this.getAvailableInternalUser(
        manager,
        process.establishment.establishmentAddress.provinceId,
        process.id,
      );

      if (availableInternalUser) {
        assignmentNew.internalUser = availableInternalUser;
        assignmentNew.rolCode = rolCode;
      }

      await assignmentRepository.save(assignmentNew);
    }

    assignment.isCurrent = false;
    assignment.observation = payload.observation;

    return assignmentRepository.save(assignment);
  }

  private async getAvailableInternalUser(
    manager: EntityManager,
    dpaId: string,
    processId: string,
  ): Promise<InternalUserRole> {
    const processRepository = manager.getRepository(ProcessEntity);
    const process = await processRepository.findOne({
      where: { id: processId },
      relations: { activity: true },
    });

    if (!process) {
      throw new NotFoundException({
        message: 'Process not found',
        error: 'Process not found',
      });
    }

    const rolCode = RoleEnum.DIRECTOR;

    let internalUser = await this.internalUserRepository.findOne({
      where: {
        user: { roles: { code: rolCode } },
        isAvailable: true,
        internalDpaUser: { hasProcess: false, dpaId },
      },
    });

    if (!internalUser) {
      const subQuery = this.internalUserRepository
        .createQueryBuilder('iu')
        .select('iu.id')
        .innerJoin('iu.user', 'user')
        .innerJoin('user.roles', 'role')
        .where('role.code = :rolCode', { rolCode });

      await this.internalDpaUserRepository
        .createQueryBuilder()
        .update(InternalDpaUserEntity)
        .set({ hasProcess: false })
        .where('dpaId = :dpaId', { dpaId })
        .andWhere(`internalUserId IN (${subQuery.getQuery()})`)
        .setParameters({
          dpaId,
          ...subQuery.getParameters(),
        })
        .execute();

      // Reintentar obtener un usuario disponible
      internalUser = await this.internalUserRepository.findOne({
        where: {
          user: { roles: { code: rolCode } },
          isAvailable: true,
          internalDpaUser: { hasProcess: false, dpaId },
        },
      });
    }

    if (internalUser) {
      const exists = await this.internalDpaUserRepository
        .createQueryBuilder('idu')
        .innerJoin('idu.internalUser', 'iu')
        .innerJoin('iu.user', 'u')
        .innerJoin('u.roles', 'r')
        .where('idu.dpa_id = :dpaId', { dpaId })
        .andWhere('idu.internal_user_id = :internalUserId', {
          internalUserId: internalUser.id,
        })
        .andWhere('r.code = :rolCode', { rolCode })
        .getExists();

      if (exists) {
        await this.internalDpaUserRepository.update(
          {
            dpa: { id: dpaId },
            internalUser: { id: internalUser.id },
          },
          {
            hasProcess: true,
          },
        );
      }
    }

    return { availableInternalUser: internalUser, rolCode };
  }

  async saveResultProcessDirector(
    payload: DocumentReviewDto,
    user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const process = await this.dataSource.transaction(async (manager) => {
      const process = await this.saveState(manager, payload, user);
      await this.saveResultDirector(manager, process, user);
      await this.saveAssignment(manager, payload, process);

      return process;
    });

    if (!process) {
      throw new Error();
    }
    const responseSendEmail = await this.emailService.sendExternalResultEmail(
      process,
      payload.processState,
      payload.observation,
    );

    if (responseSendEmail) {
      return {
        data: null,
        title: responseSendEmail.title,
        message: responseSendEmail.message,
      };
    }
    return {
      data: null,
      title: 'Resultado guardado de manera exitosa',
      message: 'Recuerde revisar su correo electronico de manera permanente',
    };
  }

  private async saveResultDirector(
    manager: EntityManager,
    process: ProcessEntity,
    user: UserEntity,
  ): Promise<CadastreEntity | null> {
    let cadastre: CadastreEntity | null = null;
    const languageRepository = manager.getRepository(LanguageEntity);
    const modalityRepository = manager.getRepository(AdventureModalityEntity);
    const protectedAreaRepository = manager.getRepository(ProtectedAreaEntity);
    const credentialRepository = manager.getRepository(CredentialEntity);

    const languages = await languageRepository.find({ where: { processId: process.id } });
    const modalities = await modalityRepository.find({ where: { processId: process.id } });
    const areas = await protectedAreaRepository.find({ where: { processId: process.id } });
    const credentials = await credentialRepository.find({
      where: { processId: process.id },
      relations: { classification: true },
    });

    const credentialStateCurrent = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueCredentialsStateEnum.current &&
        item.type === CoreCatalogueTypeEnum.credentials_state,
    );

    const credentialStateRejected = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueCredentialsStateEnum.rejected &&
        item.type === CoreCatalogueTypeEnum.credentials_state,
    );

    if (!credentialStateCurrent || !credentialStateRejected) {
      throw new NotFoundException({
        message: 'No existen todos los estados de las credenciales configurados.',
        error: 'Estado de la Credencial',
      });
    }

    if (process.state.code === CatalogueProcessesStateEnum.approved) {
      cadastre = await this.saveCadastre(manager, user, process);

      const value = cadastre.registerNumber;
      const code = value.slice(13);

      for (const language of languages) {
        language.enabled = true;
        await languageRepository.save(language);
      }

      for (const modality of modalities) {
        modality.enabled = true;
        await modalityRepository.save(modality);
      }

      for (const area of areas) {
        area.enabled = true;
        await protectedAreaRepository.save(area);
      }

      const currentDate = new Date();
      const expirationDate = new Date(currentDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 4);

      for (const credential of credentials) {
        const credentialNew = credentialRepository.create();

        switch (process.type.code) {
          case CatalogueProcessesTypeEnum.readmission: {
            if (!credential.endedAt) {
              credentialNew.startedAt = currentDate;
              credentialNew.endedAt = expirationDate;
            } else {
              const endedAt = credential.endedAt;
              credentialNew.startedAt = endedAt >= currentDate ? credential.startedAt : currentDate;
              credentialNew.endedAt = endedAt >= currentDate ? credential.endedAt : expirationDate;
              credentialNew.stateCode = credentialStateCurrent.code;
              credentialNew.stateName = credentialStateCurrent.name;
            }
            break;
          }
          case CatalogueProcessesTypeEnum.registration: {
            if (['MINTUR', 'SIETE', 'MAE'].includes(credential.origin)) {
              credentialNew.startedAt = credential.startedAt;
              credentialNew.endedAt = credential.endedAt;
              credentialNew.stateCode = credential.stateCode;
              credentialNew.stateName = credential.stateName;
            } else {
              credentialNew.startedAt = currentDate;
              credentialNew.endedAt = expirationDate;
              credentialNew.stateCode = credentialStateCurrent.code;
              credentialNew.stateName = credentialStateCurrent.name;
            }
            break;
          }
          case CatalogueProcessesTypeEnum.renewal_classification_update: {
            const credentialExpired = await credentialRepository.findOne({
              where: {
                establishmentId: process.establishmentId,
                classificationId: credential.classificationId,
                enabled: true,
              },
            });
            if (!credentialExpired) {
              throw new NotFoundException({
                message: 'No existe una credencial caducada',
                error: 'Credencial',
              });
            }
            await credentialRepository.softRemove(credentialExpired);

            credentialNew.startedAt = currentDate;
            credentialNew.endedAt = expirationDate;
            credentialNew.stateCode = credentialStateCurrent.code;
            credentialNew.stateName = credentialStateCurrent.name;
            break;
          }
          case CatalogueProcessesTypeEnum.new_classification_update: {
            credentialNew.startedAt = currentDate;
            credentialNew.endedAt = expirationDate;
            credentialNew.stateCode = credentialStateCurrent.code;
            credentialNew.stateName = credentialStateCurrent.name;
            break;
          }
        }

        credentialNew.classificationId = credential.classificationId;
        credentialNew.categoryId = credential.categoryId;
        credentialNew.processId = credential.processId;
        credentialNew.enabled = true;
        credentialNew.establishmentId = credential.establishmentId;
        credentialNew.geographicAreaId = credential.geographicAreaId;
        credentialNew.origin = OriginSystemEnum.siturin;
        credentialNew.code = credential.classification.acronym + code;

        await credentialRepository.save(credentialNew);
        await credentialRepository.softRemove(credential);
      }
    } else {
      for (const language of languages) {
        await languageRepository.softRemove(language);
      }

      for (const modality of modalities) {
        await modalityRepository.softRemove(modality);
      }

      for (const area of areas) {
        await protectedAreaRepository.softRemove(area);
      }

      for (const credential of credentials) {
        const { id, createdAt, updatedAt, ...credentialClone } = credential;

        const credentialNew = credentialRepository.create(credentialClone);

        credentialNew.stateCode = credentialStateRejected.code;
        credentialNew.stateName = credentialStateRejected.name;

        await credentialRepository.save(credentialNew);
        await credentialRepository.softRemove(credential);
      }
    }

    return cadastre;
  }

  private async saveCadastre(
    manager: EntityManager,
    user: UserEntity,
    process: ProcessEntity,
  ): Promise<CadastreEntity> {
    const cadastreRepository = manager.getRepository(CadastreEntity);

    const stateRatified = (await this.cataloguesService.findCache()).find(
      (item) =>
        item.code == CatalogueCadastresStateEnum.ratified &&
        item.type === CoreCatalogueTypeEnum.cadastre_states_state,
    );

    const cadastreEstablishment = await cadastreRepository
      .createQueryBuilder('cadastres')
      .innerJoin('cadastres.process', 'process')
      .innerJoin('process.establishment', 'establishment')
      .where('establishment.id = :id', { id: process.establishment.id })
      .getOne();

    let registerNumber = '';
    let registeredAt = new Date();
    if (!cadastreEstablishment) {
      const establishmentNumber = process?.establishment.number.padStart(3, '0');

      const cadastreLast = await cadastreRepository
        .createQueryBuilder('cadastres')
        .innerJoin('cadastres.process', 'processes')
        .innerJoin('processes.activity', 'activities')
        .where('activities.code IN (:...activityCodes)', {
          activityCodes: [
            CatalogueActivitiesCodeEnum.guide_continent,
            CatalogueActivitiesCodeEnum.guide_galapagos,
          ],
        })
        .orderBy('processes.id', 'ASC')
        .addOrderBy('SUBSTRING(cadastres.register_number, 21)', 'DESC')
        .getOne();

      const init = '10';
      let sequential = '1';

      if (cadastreLast) {
        sequential = (parseInt(cadastreLast.registerNumber.substring(21)) + 1).toString();
      }

      sequential = `${init}${sequential.padStart(6, '0')}`;

      registerNumber = `${process?.establishment.ruc.number}.${establishmentNumber}.${sequential}`;
    } else {
      registerNumber = cadastreEstablishment.registerNumber;
      registeredAt = cadastreEstablishment.registeredAt;
      await cadastreRepository.softRemove(cadastreEstablishment);
    }

    const cadastre = cadastreRepository.create();
    cadastre.processId = process.id;
    cadastre.registerNumber = registerNumber;
    cadastre.registeredAt = registeredAt;
    cadastre.systemOrigin = OriginSystemEnum.siturin;

    if (stateRatified) {
      cadastre.state = stateRatified;
    }
    const cadastreSave = await cadastreRepository.save(cadastre);

    const cadastreStateRepository = manager.getRepository(CadastreStateEntity);
    const cadastreState = cadastreStateRepository.create();
    cadastreState.cadastreId = cadastreSave.id;
    cadastreState.userId = user.id;
    if (stateRatified) {
      cadastreState.stateId = stateRatified.id;
    }
    await cadastreStateRepository.save(cadastreState);

    return cadastreSave;
  }

  async findCadastres(params: PaginationDto): Promise<ServiceResponseHttpInterface> {
    const response = await this.cadastreRepository.findAndCount({
      where: {
        process: {
          activity: [
            { code: CatalogueActivitiesCodeEnum.guide_continent },
            { code: CatalogueActivitiesCodeEnum.guide_galapagos },
          ],
        },
      },
      relations: {
        process: {
          type: true,
          state: true,
          establishment: {
            ruc: true,
            establishmentContactPerson: true,
            establishmentAddress: true,
            credentials: { classification: true },
            province: true,
            canton: true,
            parish: true,
          },
          credentials: { classification: true },
          activity: true,
        },
        state: true,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      data: response[0],
      pagination: { limit: params.limit, totalItems: response[1] },
    };
  }

  async createInactivation(
    payload: InactivationDto,
    user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    const cadastre = await this.dataSource.transaction(async (manager) => {
      const process = await this.saveInactivationProcess(manager, payload, user);
      const cadastre = await this.saveInactivationCadastre(manager, payload, process);
      const credential = await this.saveInactivationCredential(manager, payload, process);

      return cadastre;
    });

    if (!cadastre) {
      throw new Error();
    }
    const responseSendEmail = await this.emailService.sendProcessInactivationEmail(cadastre);

    if (responseSendEmail) {
      return {
        data: cadastre,
        title: responseSendEmail.title,
        message: responseSendEmail.message,
      };
    }
    return {
      data: null,
      title: 'Proceso de Inactivación completado de manera exitosa',
      message: 'Recuerde revisar su correo electronico de manera permanente',
    };
  }

  private async saveInactivationProcess(
    manager: EntityManager,
    payload: InactivationDto,
    user: UserEntity,
  ): Promise<ProcessEntity> {
    const processRepository = manager.getRepository(ProcessEntity);
    const processStateRepository = manager.getRepository(ProcessStateEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);
    const inactivationCauseRepository = manager.getRepository(InactivationCauseEntity);

    const processOld = await processRepository.findOne({
      where: { establishmentId: payload.establishmentId },
    });

    if (!processOld) {
      throw new NotFoundException({
        error: 'No existe el tramite',
        message: 'No encontrado',
      });
    }

    const inactivationCauseType = await catalogueRepository.findOne({
      where: {
        code: CatalogueInactivationCauseCodeEnum.oficio,
        type: CoreCatalogueTypeEnum.inactivation_cause_type,
      },
    });

    const processStateCatalogue = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.completed,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    const processNew = processRepository.create();
    processNew.activityId = processOld?.activityId;
    processNew.professionalTitleId = processOld?.professionalTitleId;
    processNew.establishmentId = payload.establishmentId;
    processNew.typeId = payload.processType.id;
    processNew.driverLicenseId = processOld.driverLicenseId;
    processNew.registeredAt = new Date();
    processNew.startedAt = new Date();
    processNew.endedAt = new Date();
    processNew.totalWomen = processOld.totalWomen;
    processNew.totalWomenDisability = processOld.totalWomenDisability;
    processNew.totalMen = processOld.totalMen;
    processNew.totalMenDisability = processOld.totalMenDisability;
    if (inactivationCauseType) {
      processNew.inactivationCauseTypeId = inactivationCauseType.id;
    }
    if (processStateCatalogue) {
      processNew.stateId = processStateCatalogue.id;
    }

    await processRepository.softRemove(processOld);
    const processNewSave = await processRepository.save(processNew);

    const processState = processStateRepository.create();
    processState.processId = processNewSave.id;
    processState.startedAt = new Date();
    processState.endedAt = new Date();
    processState.userId = user.id;
    if (processStateCatalogue) {
      processState.stateCode = processStateCatalogue.code;
      processState.stateName = processStateCatalogue.name;
    }
    await processStateRepository.save(processState);

    if (payload.inactivationCauses) {
      for (const item of payload.inactivationCauses) {
        const inactivationCause = inactivationCauseRepository.create();
        inactivationCause.processId = processNewSave.id;
        inactivationCause.code = item.code;
        inactivationCause.name = item.name;
        await inactivationCauseRepository.save(inactivationCause);
      }
    }

    return processNewSave;
  }

  private async saveInactivationCadastre(
    manager: EntityManager,
    payload: InactivationDto,
    process: ProcessEntity,
  ): Promise<CadastreEntity> {
    const cadastreRepository = manager.getRepository(CadastreEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const cadastreOld = await cadastreRepository.findOne({ where: { id: payload.cadastreId } });

    if (!cadastreOld) {
      throw new NotFoundException({
        error: 'No existe el catastro',
        message: 'No encontrado',
      });
    }

    await cadastreRepository.softRemove(cadastreOld);

    const catalogue = await catalogueRepository.findOne({
      where: {
        code: CatalogueCadastresStateEnum.inactive,
        type: CoreCatalogueTypeEnum.cadastre_states_state,
      },
    });

    const cadastre = cadastreRepository.create();
    cadastre.processId = process.id;
    cadastre.registerNumber = cadastreOld.registerNumber;
    cadastre.registeredAt = new Date();
    cadastre.systemOrigin = cadastreOld.systemOrigin;

    if (catalogue) {
      cadastre.stateId = catalogue.id;
    }
    const cadastreSave = await cadastreRepository.save(cadastre);

    const cadastreStateRepository = manager.getRepository(CadastreStateEntity);
    const cadastreState = cadastreStateRepository.create();
    cadastreState.cadastreId = cadastreSave.id;
    if (catalogue) {
      cadastreState.stateId = catalogue.id;
    }
    await cadastreStateRepository.save(cadastreState);

    return cadastreSave;
  }

  private async saveInactivationCredential(
    manager: EntityManager,
    payload: InactivationDto,
    process: ProcessEntity,
  ): Promise<void> {
    const credentialRepository = manager.getRepository(CredentialEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const credentialsOld = await credentialRepository.find({
      where: { establishmentId: payload.establishmentId, enabled: true },
    });

    if (credentialsOld.length === 0) {
      throw new NotFoundException({
        error: 'No existen credenciales',
        message: 'No encontradas',
      });
    }

    const stateCredential = await catalogueRepository.findOne({
      where: {
        code: CatalogueCredentialsStateEnum.expired_inactive,
        type: CoreCatalogueTypeEnum.credentials_state,
      },
    });

    for (const credentialOld of credentialsOld) {
      const credentialNew = credentialRepository.create();
      credentialNew.establishmentId = credentialOld.establishmentId;
      credentialNew.processId = process.id;
      credentialNew.geographicAreaId = credentialOld.geographicAreaId;
      credentialNew.code = credentialOld.code;
      credentialNew.classificationId = credentialOld.classificationId;
      credentialNew.categoryId = credentialOld.categoryId;
      credentialNew.origin = credentialOld.origin;
      credentialNew.startedAt = credentialOld.startedAt;
      credentialNew.endedAt = credentialOld.endedAt;
      if (credentialOld.stateCode === CatalogueCredentialsStateEnum.current) {
        if (stateCredential) {
          credentialNew.stateCode = stateCredential?.code;
          credentialNew.stateName = stateCredential.name;
        }
      } else {
        credentialNew.stateCode = credentialOld.stateCode;
        credentialNew.stateName = credentialOld.stateName;
      }

      await credentialRepository.save(credentialNew);

      await credentialRepository.softRemove(credentialOld);
    }
  }
}
