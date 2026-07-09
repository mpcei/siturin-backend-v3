import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class GuideTechnicianService {
  private paginateFilterService: PaginateFilterService<CadastreEntity>;

  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private processRepository: Repository<ProcessEntity>,
    @Inject(CoreRepositoryEnum.ASSIGNMENT_REPOSITORY)
    private assignmentRepository: Repository<AssignmentEntity>,
    private readonly emailService: EmailService,
  ) {}

  async findProcessesByUser(
    user: UserEntity,
    params: PaginationDto,
  ): Promise<ServiceResponseHttpInterface> {
    console.log('User', user);
    const response = await this.assignmentRepository.findAndCount({
      where: { internalUser: { userId: user.id }, isCurrent: true },
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

  async findProcessById(processId: string): Promise<ResponseHttpInterface> {
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

    console.log(JSON.stringify(process?.establishment.ruc.user, null, 2));

    return {
      data: process,
      title: 'Busqueda exitosa',
      message: '',
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
