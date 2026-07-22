import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  CatalogueCadastresStateEnum,
  CatalogueCredentialsStateEnum,
  CatalogueInactivationCauseCodeEnum,
  CatalogueProcessesStateEnum,
  CoreCatalogueTypeEnum,
  CoreRepositoryEnum,
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
import { PaginationDto } from '@utils/pagination';
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
    private readonly emailService: EmailService,
  ) {}

  async findProcessesByUser(
    user: UserEntity,
    params: PaginationDto,
    rolCode: string,
  ): Promise<ServiceResponseHttpInterface> {
    const response = await this.assignmentRepository.findAndCount({
      where: { rolCode: rolCode, internalUser: { userId: user.id }, isCurrent: true },
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
  ): Promise<ResponseHttpInterface> {
    const find = await this.dataSource.transaction(async (manager) => {
      return await this.saveProcessState(manager, processId, user, rolCode);
    });

    if (!find) {
      throw new BadRequestException({
        message: 'Trámite en estado diferente al requerido',
        error: 'Estado Trámite',
      });
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

    const lastAssigment = this.assignmentRepository.findOne({
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

    if (!processStateInProcess || !processStateInReview || !processStateInApproval) {
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

    const currentState =
      rolCode === RoleEnum.GUIDE_TECHNICIAN ? processStateInProcess : processStateInReview;

    const nextState =
      rolCode === RoleEnum.GUIDE_TECHNICIAN ? processStateInReview : processStateInApproval;

    if (process.state.code !== currentState.code) {
      return process.state.code === nextState.code;
    }

    process.state = nextState;

    await processRepository.save(process);

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
    const process = await this.dataSource.transaction(async (manager) => {
      const process = await this.saveResult(manager, payload, user);
      const assignment = await this.saveAssignment(manager, payload, process);

      return process;
    });
    /*
    if (!process) {
      throw new Error();
    }
    const responseSendEmail = await this.emailService.sendProcessInactivationEmail(cadastre);

    if (responseSendEmail) {
      return {
        data: cadastre,
        title: responseSendEmail.title,
        message: responseSendEmail.message,
      };
    }*/
    return {
      data: null,
      title: 'Resultado guardado de manera exitosa',
      message: 'Recuerde revisar su correo electronico de manera permanente',
    };
  }

  private async saveResult(
    manager: EntityManager,
    payload: DocumentReviewDto,
    user: UserEntity,
  ): Promise<ProcessEntity> {
    const processStateRepository = manager.getRepository(ProcessStateEntity);
    const processRepository = manager.getRepository(ProcessEntity);
    const processGuideRepository = manager.getRepository(ProcessGuideEntity);

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
      relations: { state: true, establishment: { establishmentAddress: true } },
    });

    if (!process) {
      throw new NotFoundException({
        message: 'No existe el Proceso',
        error: 'Proceso',
      });
    }

    process.state = payload.processState;
    await processRepository.save(process);

    await processGuideRepository.save(payload.processGuides);

    return process;
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
      await this.internalDpaUserRepository
        .createQueryBuilder('internalDpaUser')
        .innerJoin('internalDpaUser.user', 'user')
        .innerJoin('user.roles', 'role')
        .update(InternalDpaUserEntity)
        .set({ hasProcess: true })
        .where('dpa_id = :dpaId AND internal_user_id = :internalUserId', {
          dpaId,
          internalUserId: internalUser.id,
        })
        .andWhere('role.code = :rolCode', { rolCode })
        .execute();
    }

    return { availableInternalUser: internalUser, rolCode };
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
        code: CatalogueInactivationCauseCodeEnum.peticion,
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
      where: { establishmentId: payload.establishmentId },
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
