import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, ILike, In } from 'typeorm';

import { CatalogueUsersSexEnum, ConfigEnum } from '@utils/enums';
import { ResponseHttpInterface } from '@utils/interfaces';
import {
  CadastreEntity,
  CadastreStateEntity,
  ClassificationEntity,
  EstablishmentAddressEntity,
  EstablishmentContactPersonEntity,
  EstablishmentEntity,
  InactivationCauseEntity,
  LandTransportEntity,
  ProcessEntity,
} from '@modules/core/entities';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { UserEntity } from '@auth/entities';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import {
  BaseProcessGuideDto,
  EstablishmentDto,
  UserDto,
} from '@modules/core/roles/external/dto/process-guide';
import { ProcessGuideEntity } from '@modules/core/entities/process-guide.entity';
import {
  CatalogueCadastresStateEnum,
  CatalogueCredentialsStateEnum,
  CatalogueInactivationCauseCodeEnum,
  CatalogueProcessesStateEnum,
  CatalogueProcessGuidesCodeEnum,
  CoreCatalogueTypeEnum,
} from '@modules/core/utils/enums';
import { FileService } from '@modules/common/file/file.service';
import { AdventureModalityEntity } from '@modules/core/entities/adventure-modality.entity';
import { ProtectedAreaEntity } from '@modules/core/entities/protected-area.entity';
import { LanguageEntity } from '@modules/core/entities/language.entity';
import { CataloguesService } from '@modules/common/catalogue/catalogue.service';
import { CredentialEntity } from '@modules/core/entities/credential.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { DpaEntity } from '@modules/common/dpa/dpa.entity';
import { BaseWithOriginProcessGuideDto } from '@modules/core/roles/external/dto/process-guide/base-with-origin-process-guide.dto';
import { InactivationDto } from '@modules/core/roles/external/dto/process-guide/inactivation.dto';
import { ProcessStateEntity } from '@modules/core/entities/process-state.entity';

@Injectable()
export class ProcessGuideService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly processService: ProcessService,
    private readonly cataloguesService: CataloguesService,
  ) {}

  async createRegistration(
    payload: BaseProcessGuideDto,
    user: UserEntity,
    files: Express.Multer.File[],
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const userUpdate = await this.saveUser(manager, payload.user, user);
      const process = await this.saveProcess(manager, payload, userUpdate);
      const cadastre = await this.saveCadastre(manager, user, process);
      const establishment = await this.saveEstablishment(
        manager,
        payload.establishment,
        payload.user,
        process.id,
      );
      const processGuide = await this.saveProcessGuide(
        manager,
        userUpdate,
        files,
        payload,
        process,
      );

      return {
        data: null,
        title: 'Solicitud enviada',
        message: 'Recuerde revisar su correo electronico de manera permanente',
      };
    });
  }

  private async saveEstablishment(
    manager: EntityManager,
    establishmentLoad: EstablishmentDto,
    user: UserDto,
    processId: string,
  ): Promise<EstablishmentEntity> {
    const establishmentRepository = manager.getRepository(EstablishmentEntity);
    const establishmentAddressRepository = manager.getRepository(EstablishmentAddressEntity);
    const establishmentContactPersonRepository = manager.getRepository(
      EstablishmentContactPersonEntity,
    );

    const establishment = await establishmentRepository.findOne({
      where: { id: establishmentLoad.id },
    });

    if (!establishment) {
      throw new NotFoundException();
    }
    establishment.id = establishmentLoad.id;
    establishment.provinceId = establishmentLoad.province.id;
    establishment.cantonId = establishmentLoad.canton.id;
    establishment.parishId = establishmentLoad.parish.id;
    establishment.mainStreet = establishmentLoad.mainStreet;
    establishment.numberStreet = establishmentLoad.numberStreet;
    establishment.secondaryStreet = establishmentLoad.secondaryStreet;
    establishment.referenceStreet = establishmentLoad.referenceStreet;
    establishment.latitude = establishmentLoad.latitude;
    establishment.longitude = establishmentLoad.longitude;
    establishment.isCadastre = true;

    await establishmentRepository.save(establishment);

    const establishmentAddress = establishmentAddressRepository.create();
    establishmentAddress.establishmentId = establishmentLoad.id;
    establishmentAddress.processId = processId;
    establishmentAddress.provinceId = establishmentLoad.province.id;
    establishmentAddress.cantonId = establishmentLoad.canton.id;
    establishmentAddress.parishId = establishmentLoad.parish.id;
    establishmentAddress.mainStreet = establishmentLoad.mainStreet;
    establishmentAddress.numberStreet = establishmentLoad.numberStreet;
    establishmentAddress.secondaryStreet = establishmentLoad.secondaryStreet;
    establishmentAddress.referenceStreet = establishmentLoad.referenceStreet;
    establishmentAddress.latitude = establishmentLoad.latitude;
    establishmentAddress.longitude = establishmentLoad.longitude;

    await establishmentAddressRepository.save(establishmentAddress);

    const establishmentContactPerson = establishmentContactPersonRepository.create();
    establishmentContactPerson.establishmentId = establishmentLoad.id;
    establishmentContactPerson.processId = processId;
    establishmentContactPerson.phone = user.phone;
    establishmentContactPerson.secondaryPhone = user.secondaryPhone;
    establishmentContactPerson.email = user.email;

    await establishmentContactPersonRepository.save(establishmentContactPerson);

    return establishment;
  }

  private async saveUser(
    manager: EntityManager,
    payload: UserDto,
    user: UserEntity,
  ): Promise<UserEntity> {
    const userRepository = manager.getRepository(UserEntity);
    const userUpdate = await userRepository.findOne({
      where: { id: user.id },
      relations: { sex: true },
    });

    if (!userUpdate) {
      throw new NotFoundException();
    }
    userUpdate.hasDisability = payload.hasDisability;
    userUpdate.bloodTypeId = payload.bloodType.id;

    await userRepository.save(userUpdate);

    return userUpdate;
  }

  private async saveProcess(
    manager: EntityManager,
    payload: BaseProcessGuideDto,
    user: UserEntity,
  ): Promise<ProcessEntity> {
    const processRepository = manager.getRepository(ProcessEntity);
    const processStateRepository = manager.getRepository(ProcessStateEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);
    const credentialRepository = manager.getRepository(CredentialEntity);

    const processStateCatalogue = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.in_progress,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });

    const process = processRepository.create();
    process.activityId = payload.process.activity.id;
    process.professionalTitleId = payload.process.professionalTitle.id;
    process.establishmentId = payload.establishment.id;
    process.type = payload.process.type.id;
    process.driverLicenseId = payload.process?.driverLicense?.id;
    process.registeredAt = new Date();
    process.startedAt = payload.process.startedAt;
    process.endedAt = payload.process.endedAt;
    if (user.sex?.code === CatalogueUsersSexEnum.female) {
      process.totalWomen = 1;
      if (user.hasDisability) process.totalWomenDisability = 1;
    } else {
      process.totalMen = 1;
      if (user.hasDisability) process.totalMenDisability = 1;
    }

    if (processStateCatalogue) {
      process.stateId = processStateCatalogue.id;
    }
    const saveProcess = await processRepository.save(process);

    const processState = processStateRepository.create();
    processState.processId = saveProcess.id;
    processState.startedAt = new Date();
    processState.userId = user.id;
    if (processStateCatalogue) {
      processState.stateCode = processStateCatalogue.code;
      processState.stateName = processStateCatalogue.name;
    }
    await processStateRepository.save(processState);

    const credential = credentialRepository.create();
    credential.classificationId = payload.process.classification.id;
    credential.categoryId = payload.process.category.id;
    credential.processId = saveProcess.id;
    credential.establishmentId = payload.establishment.id;
    credential.geographicAreaId = payload.process.geographicArea.id;
    await credentialRepository.save(credential);

    return saveProcess;
  }

  private async saveCadastre(
    manager: EntityManager,
    user: UserEntity,
    process: ProcessEntity,
  ): Promise<CadastreEntity> {
    const cadastreRepository = manager.getRepository(CadastreEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const catalogue = await catalogueRepository.findOne({
      where: {
        code: CatalogueCadastresStateEnum.ratified,
        type: CoreCatalogueTypeEnum.cadastre_states_state,
      },
    });

    const cadastre = cadastreRepository.create();
    cadastre.processId = process.id;
    cadastre.registerNumber = '14528798457.002.001';
    cadastre.registeredAt = new Date();
    cadastre.systemOrigin = 'SITURIN';

    if (catalogue) {
      cadastre.stateId = catalogue.id;
    }
    const cadastreSave = await cadastreRepository.save(cadastre);

    const cadastreStateRepository = manager.getRepository(CadastreStateEntity);
    const cadastreState = cadastreStateRepository.create();
    cadastreState.cadastreId = cadastreSave.id;
    cadastreState.userId = user.id;
    if (catalogue) {
      cadastreState.stateId = catalogue.id;
    }
    await cadastreStateRepository.save(cadastreState);

    return cadastreSave;
  }

  private async saveProcessGuide(
    manager: EntityManager,
    user: UserEntity,
    files: Express.Multer.File[],
    payload: BaseProcessGuideDto,
    process: ProcessEntity,
  ): Promise<boolean> {
    const processGuideRepository = manager.getRepository(ProcessGuideEntity);
    const AdventureModalityRepository = manager.getRepository(AdventureModalityEntity);
    const ProtectedAreaRepository = manager.getRepository(ProtectedAreaEntity);
    const LanguageRepository = manager.getRepository(LanguageEntity);

    for (const item of payload.processGuides) {
      const processGuide = processGuideRepository.create();
      processGuide.processId = process.id;
      processGuide.requirementId = item.requirement.id;
      processGuide.value = item.value;
      const processGuideSave = await processGuideRepository.save(processGuide);

      await this.saveFile(
        manager,
        user,
        files,
        processGuideSave.id,
        processGuideSave.requirementId,
      );

      //Guardar areas protegidas
      if (item.requirement.code === CatalogueProcessGuidesCodeEnum.pane) {
        const processRepository = manager.getRepository(ProcessEntity);
        process.isProtectedArea = item.value == 'true';
        await processRepository.save(process);

        for (const item of payload.protectedAreas) {
          const protectedArea = ProtectedAreaRepository.create();
          protectedArea.processId = process.id;
          protectedArea.establishmentId = payload.establishment.id;
          protectedArea.provinceId = item.province.id;
          protectedArea.cantonId = item.canton.id;
          protectedArea.areaCode = item.areaCode;
          protectedArea.areaName = item.areaName;

          const protectedAreaSave = await ProtectedAreaRepository.save(protectedArea);
        }
      }

      //Guardar modalidades de aventura
      if (
        (item.requirement.code === CatalogueProcessGuidesCodeEnum.modality_adventure_guide ||
          item.requirement.code === CatalogueProcessGuidesCodeEnum.modality_adventure) &&
        item.value === 'true'
      ) {
        for (const item2 of payload.adventureModalities) {
          const adventureModality = AdventureModalityRepository.create();
          adventureModality.processId = process.id;
          adventureModality.establishmentId = payload.establishment.id;
          adventureModality.modalityCode = item2.modalityCode;
          adventureModality.modalityName = item2.modalityName;
          adventureModality.modalityCertificateCode = item2.modalityCertificateCode;
          adventureModality.modalityCertificateName = item2.modalityCertificateName;

          const adventureModalitySave = await AdventureModalityRepository.save(adventureModality);

          await this.saveFile(
            manager,
            user,
            files,
            adventureModalitySave.id,
            adventureModalitySave.modalityCode,
          );
          if (
            item.requirement.code === CatalogueProcessGuidesCodeEnum.modality_adventure_guide &&
            (item2.modalityCode === CatalogueProcessGuidesCodeEnum.high_mountain ||
              item2.modalityCode === CatalogueProcessGuidesCodeEnum.mid_mountain)
          ) {
            await this.saveLandTransport(manager, user, files, payload, process);
          }
        }
      }

      //Guardar idioma
      if (
        item.requirement.code === CatalogueProcessGuidesCodeEnum.certification_language &&
        item.value === 'true'
      ) {
        for (const item of payload.languages) {
          const language = LanguageRepository.create();
          language.processId = process.id;
          language.establishmentId = payload.establishment.id;
          language.languageCode = item.languageCode;
          language.languageName = item.languageName;
          language.levelCode = item.levelCode;
          language.levelName = item.levelName;
          language.motherLanguage = item.motherLanguage;

          const languageSave = await LanguageRepository.save(language);

          await this.saveFile(manager, user, files, languageSave.id, languageSave.languageCode);
        }
      }
    }

    return true;
  }

  private async saveLandTransport(
    manager: EntityManager,
    user: UserEntity,
    files: Express.Multer.File[],
    payload: BaseProcessGuideDto,
    process: ProcessEntity,
  ): Promise<boolean> {
    const landTransportRepository = manager.getRepository(LandTransportEntity);

    let i = 0;
    for (const item of payload.landTransports) {
      const landTransport = landTransportRepository.create();
      landTransport.processId = process.id;
      landTransport.typeId = item.type.id;
      landTransport.plate = item.plate;
      landTransport.year = item.year;
      const landTransportSave = await landTransportRepository.save(landTransport);

      const typeVehicleRegistration = (await this.cataloguesService.findCache()).find(
        (item) =>
          item.code === CatalogueProcessGuidesCodeEnum.vehicle_registration &&
          item.type === CoreCatalogueTypeEnum.requirement_item,
      );
      await this.saveFile(
        manager,
        user,
        files,
        landTransportSave.id,
        CatalogueProcessGuidesCodeEnum.vehicle_registration + i,
        typeVehicleRegistration?.id,
      );

      const typeDocumentVehicleInspection = (await this.cataloguesService.findCache()).find(
        (item) =>
          item.code === CatalogueProcessGuidesCodeEnum.document_vehicle_inspection &&
          item.type === CoreCatalogueTypeEnum.requirement_item,
      );
      await this.saveFile(
        manager,
        user,
        files,
        landTransportSave.id,
        CatalogueProcessGuidesCodeEnum.document_vehicle_inspection + i,
        typeDocumentVehicleInspection?.id,
      );

      const typeAccidentPolicy = (await this.cataloguesService.findCache()).find(
        (item) =>
          item.code === CatalogueProcessGuidesCodeEnum.accident_policy &&
          item.type === CoreCatalogueTypeEnum.requirement_item,
      );
      await this.saveFile(
        manager,
        user,
        files,
        landTransportSave.id,
        CatalogueProcessGuidesCodeEnum.accident_policy + i,
        typeAccidentPolicy?.id,
      );
      i++;
    }
    return true;
  }

  private async saveFile(
    manager: EntityManager,
    user: UserEntity,
    files: Express.Multer.File[],
    modelId: string,
    id: string,
    typeId: undefined | string = undefined,
  ): Promise<boolean> {
    const file = files.find((item) => item.fieldname === id);
    if (!file) {
      return true;
    }
    await this.fileService.uploadProcessFile({
      file,
      manager,
      user,
      modelId,
      typeId,
      activity: 'guide',
      ruc: user.identification,
    });
    return true;
  }

  async createCurrentRegistration(
    payload: BaseWithOriginProcessGuideDto,
    user: UserEntity,
    files: Express.Multer.File[],
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const userUpdate = await this.saveUser(manager, payload.user, user);
      const process = await this.saveWithOriginProcess(manager, payload, userUpdate);
      const cadastre = await this.saveCadastre(manager, user, process);
      const establishment = await this.saveEstablishment(
        manager,
        payload.establishment,
        payload.user,
        process.id,
      );
      const processGuide = await this.saveWithOriginProcessGuide(
        manager,
        userUpdate,
        files,
        payload,
        process,
      );

      const credential = await this.saveWithOriginCredential(manager, payload, process);

      return {
        data: null,
        title: 'Solicitud enviada',
        message: 'Recuerde revisar su correo electronico de manera permanente',
      };
    });
  }

  private async saveWithOriginProcess(
    manager: EntityManager,
    payload: BaseWithOriginProcessGuideDto,
    user: UserEntity,
  ): Promise<ProcessEntity> {
    const processRepository = manager.getRepository(ProcessEntity);
    const processStateRepository = manager.getRepository(ProcessStateEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);

    const processStateCatalogue = await catalogueRepository.findOne({
      where: {
        code: CatalogueProcessesStateEnum.in_progress,
        type: CoreCatalogueTypeEnum.processes_state,
      },
    });
    console.log(payload);
    const process = processRepository.create();
    process.activityId = payload.process.activity.id;
    process.establishmentId = payload.establishment.id;
    process.typeId = payload.process.type.id;
    process.registeredAt = new Date();
    process.startedAt = payload.process.startedAt;
    process.endedAt = payload.process.endedAt;
    if (user.sex?.code === CatalogueUsersSexEnum.female) {
      process.totalWomen = 1;
      if (user.hasDisability) process.totalWomenDisability = 1;
    } else {
      process.totalMen = 1;
      if (user.hasDisability) process.totalMenDisability = 1;
    }

    if (processStateCatalogue) {
      process.stateId = processStateCatalogue.id;
    }
    const processSave = await processRepository.save(process);

    const processState = processStateRepository.create();
    processState.processId = processSave.id;
    processState.startedAt = new Date();
    processState.userId = user.id;
    if (processStateCatalogue) {
      processState.stateCode = processStateCatalogue.code;
      processState.stateName = processStateCatalogue.name;
    }
    await processStateRepository.save(processState);

    return processSave;
  }

  private async saveWithOriginProcessGuide(
    manager: EntityManager,
    user: UserEntity,
    files: Express.Multer.File[],
    payload: BaseWithOriginProcessGuideDto,
    process: ProcessEntity,
  ): Promise<boolean> {
    const processGuideRepository = manager.getRepository(ProcessGuideEntity);
    for (const item of payload.processGuides) {
      const processGuide = processGuideRepository.create();
      processGuide.processId = process.id;
      processGuide.requirementId = item.requirement.id;
      processGuide.value = item.value;
      const processGuideSave = await processGuideRepository.save(processGuide);

      if (item.requirement.code === CatalogueProcessGuidesCodeEnum.pane_guide) {
        const processRepository = manager.getRepository(ProcessEntity);
        process.isProtectedArea = item.value == 'true';
        await processRepository.save(process);
      }

      await this.saveFile(
        manager,
        user,
        files,
        processGuideSave.id,
        processGuideSave.requirementId,
      );
    }

    return true;
  }

  private async saveWithOriginCredential(
    manager: EntityManager,
    payload: BaseWithOriginProcessGuideDto,
    process: ProcessEntity,
  ): Promise<boolean> {
    const credentialRepository = manager.getRepository(CredentialEntity);
    const classificationRepository = manager.getRepository(ClassificationEntity);
    const catalogueRepository = manager.getRepository(CatalogueEntity);
    const languageRepository = manager.getRepository(LanguageEntity);
    const modalityRepository = manager.getRepository(AdventureModalityEntity);
    const protectedAreaRepository = manager.getRepository(ProtectedAreaEntity);
    const dpaRepository = manager.getRepository(DpaEntity);

    if (payload.guideOrigin.languages) {
      const languagesString = payload.guideOrigin.languages.split(',').map((i) => i.trim());
      const languagesDB = await catalogueRepository.find({
        where: { name: In(languagesString) },
      });
      if (languagesDB) {
        for (const language of languagesDB) {
          const languageSave = languageRepository.create();
          languageSave.processId = process.id;
          languageSave.establishmentId = payload.establishment.id;
          languageSave.languageCode = language.code;
          languageSave.languageName = language.name;
          await languageRepository.save(languageSave);
        }
      }
    }

    for (const item of payload.credentials) {
      const credential = credentialRepository.create();

      const classification = await classificationRepository.findOne({
        where: { code: item.classificationCode },
        relations: { category: true },
      });
      if (!classification) {
        throw new NotFoundException({
          error: 'Clasificación no homologada',
          message: 'Comunicarse con la Dirección de Acreditación y Control',
        });
      }

      const geographicArea = await catalogueRepository.findOne({
        where: {
          name: ILike(item.geographicArea),
          type: CoreCatalogueTypeEnum.activities_geographic_area,
        },
      });

      credential.classificationId = classification?.id;
      credential.categoryId = classification?.category.id;
      credential.startedAt = new Date(item.startedAt);
      credential.endedAt = new Date(item.endedAt);
      credential.code = item.code;
      credential.origin = item.origin;
      credential.processId = process.id;
      credential.establishmentId = payload.establishment.id;
      if (geographicArea) {
        credential.geographicAreaId = geographicArea.id;
      }
      await credentialRepository.save(credential);

      if (CatalogueProcessGuidesCodeEnum.guide_local === classification?.code) {
        if (item.protectedAreas) {
          const protectedAreasString = item.protectedAreas
            .split(',')
            .map((i) => i.trim().toLowerCase());
          // const protectedAreasDB = await catalogueRepository.find({
          //   where: { name: In(protectedAreasString) },
          // });
          const protectedAreasDB = await catalogueRepository
            .createQueryBuilder('catalogue')
            .where('LOWER(catalogue.name) IN (:...names)', {
              names: protectedAreasString,
            })
            .getMany();
          if (protectedAreasDB) {
            const processRepository = manager.getRepository(ProcessEntity);
            process.isProtectedArea = true;
            await processRepository.save(process);

            for (const area of protectedAreasDB) {
              const areaSave = protectedAreaRepository.create();
              areaSave.processId = process.id;
              areaSave.establishmentId = payload.establishment.id;
              areaSave.areaCode = area.code;
              areaSave.areaName = area.name;
              await protectedAreaRepository.save(areaSave);
            }
          }
        } else {
          const areaSave = protectedAreaRepository.create();
          const dpa = await dpaRepository.findOne({
            where: {
              name: ILike(payload.guideOrigin.canton),
              parent: { name: ILike(payload.guideOrigin.province) },
            },
          });
          if (dpa) {
            areaSave.processId = process.id;
            areaSave.establishmentId = payload.establishment.id;
            areaSave.cantonId = dpa?.id;
            areaSave.provinceId = dpa.parentId;
          }
        }
      }
      if (item.modalities) {
        const modalitiesString = item.modalities.split(',').map((i) => i.trim().toLowerCase());
        // const modalitiesDB = await catalogueRepository.find({
        //   where: { name: In(modalitiesString) },
        // });
        const modalitiesDB = await catalogueRepository
          .createQueryBuilder('catalogue')
          .where('LOWER(catalogue.name) IN (:...names)', {
            names: modalitiesString,
          })
          .getMany();
        if (modalitiesDB) {
          for (const modality of modalitiesDB) {
            const modalitySave = modalityRepository.create();
            modalitySave.processId = process.id;
            modalitySave.establishmentId = payload.establishment.id;
            modalitySave.modalityCode = modality.code;
            modalitySave.modalityName = modality.name;
            await modalityRepository.save(modalitySave);
          }
        }
      }
    }

    return true;
  }

  async createExpiredRegistration(
    payload: BaseWithOriginProcessGuideDto,
    user: UserEntity,
    files: Express.Multer.File[],
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const userUpdate = await this.saveUser(manager, payload.user, user);
      const process = await this.saveWithOriginProcess(manager, payload, userUpdate);
      const cadastre = await this.saveCadastre(manager, user, process);
      const establishment = await this.saveEstablishment(
        manager,
        payload.establishment,
        payload.user,
        process.id,
      );
      const processGuide = await this.saveWithOriginProcessGuide(
        manager,
        userUpdate,
        files,
        payload,
        process,
      );

      const credential = await this.saveWithOriginCredential(manager, payload, process);

      return {
        data: null,
        title: 'Solicitud enviada',
        message: 'Recuerde revisar su correo electronico de manera permanente',
      };
    });
  }

  async createInactivation(
    payload: InactivationDto,
    user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const process = await this.saveInactivationProcess(manager, payload, user);
      const cadastre = await this.saveInactivationCadastre(manager, payload, process);
      const credential = await this.saveInactivationCredential(manager, payload, process);
      return {
        data: null,
        title: 'Proceso de Inactivación completado de manera exitosa',
        message: 'Recuerde revisar su correo electronico de manera permanente',
      };
    });
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
    processNew.type = payload.processType.id;
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

  async createAutomaticInactivation(): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const cadastreRepository = manager.getRepository(CadastreEntity);
      const processRepository = manager.getRepository(ProcessEntity);
      const processStateRepository = manager.getRepository(ProcessStateEntity);
      const inactivationCauseRepository = manager.getRepository(InactivationCauseEntity);

      const state = (await this.cataloguesService.findCache()).find(
        (item) =>
          item.code == CatalogueCadastresStateEnum.ratified &&
          item.type == CoreCatalogueTypeEnum.cadastre_states_state,
      );

      const today = new Date();
      const cadastres = await cadastreRepository
        .createQueryBuilder('cadastre')
        .innerJoin('cadastre.process', 'process')
        .innerJoin('process.establishment', 'establishment')
        .where('cadastre.stateId = :stateId', {
          stateId: state?.id,
        })
        .andWhere((qb) => {
          const existsCredential = qb
            .subQuery()
            .select('1')
            .from(CredentialEntity, 'c')
            .where('c.establishmentId = establishment.id')
            .getQuery();

          return `EXISTS ${existsCredential}`;
        })
        .andWhere((qb) => {
          const activeCredential = qb
            .subQuery()
            .select('1')
            .from(CredentialEntity, 'c')
            .where('c.establishmentId = establishment.id')
            .andWhere('c.endedAt >= :today')
            .getQuery();

          return `NOT EXISTS ${activeCredential}`;
        })
        .setParameter('today', today)
        .getMany();

      console.log(cadastres);

      const stateProcess = (await this.cataloguesService.findCache()).find(
        (item) =>
          item.code == CatalogueProcessesStateEnum.in_progress &&
          item.type == CoreCatalogueTypeEnum.processes_state,
      );

      for (const cadastre of cadastres) {
        const processOld = await processRepository.findOne({
          where: { id: cadastre.processId },
          relations: { establishment: true },
        });

        const processInProgress = await processRepository.findOne({
          where: { establishmentId: processOld?.establishmentId, stateId: stateProcess?.id },
        });
        /*
        if (!processInProgress) {

          //Inactivation Process
          const inactivationCauseType = (await this.cataloguesService.findCache()).find(
            (item) =>
              item.code == CatalogueInactivationCauseCodeEnum.oficio &&
              item.type == CoreCatalogueTypeEnum.inactivation_cause_type,
          );

          const processStateCatalogue = (await this.cataloguesService.findCache()).find(
            (item) =>
              item.code == CatalogueProcessesStateEnum.completed &&
              item.type == CoreCatalogueTypeEnum.processes_state,
          );

          const processNew = processRepository.create();
          processNew.activityId = processOld?.activityId;
          processNew.professionalTitleId = processOld?.professionalTitleId;
          processNew.establishmentId = processOld.establishmentId;
          processNew.type = payload.processType.id;
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
        }*/
      }

      return {
        data: null,
        title: 'Proceso de Inactivación completado de manera exitosa',
        message: 'Recuerde revisar su correo electronico de manera permanente',
      };
    });
  }
}
