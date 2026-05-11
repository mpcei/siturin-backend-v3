import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { CatalogueUsersSexEnum, ConfigEnum } from '@utils/enums';
import { ResponseHttpInterface } from '@utils/interfaces';
import {
  EstablishmentAddressEntity,
  EstablishmentContactPersonEntity,
  EstablishmentEntity,
  LandTransportEntity,
  ProcessEntity,
} from '@modules/core/entities';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { UserEntity } from '@auth/entities';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import { BaseProcessGuideDto } from '@modules/core/roles/external/dto/process-guide';
import { ProcessGuideEntity } from '@modules/core/entities/process-guide.entity';
import { CatalogueProcessGuidesCodeEnum, CoreCatalogueTypeEnum } from '@modules/core/utils/enums';
import { FileService } from '@modules/common/file/file.service';
import { AdventureModalityEntity } from '@modules/core/entities/adventure-modality.entity';
import { ProtectedAreaEntity } from '@modules/core/entities/protected-area.entity';
import { LanguageEntity } from '@modules/core/entities/language.entity';
import { CataloguesService } from '@modules/common/catalogue/catalogue.service';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

@Injectable()
export class ProcessGuideService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly processService: ProcessService,
    private readonly catalogueService: CataloguesService,
  ) {}

  async createRegistration(
    payload: BaseProcessGuideDto,
    user: UserEntity,
    files: Express.Multer.File[],
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const userUpdate = await this.saveUser(manager, payload, user);
      const process = await this.saveProcess(manager, payload, userUpdate);
      const establishment = await this.saveEstablishment(manager, payload, process.id);
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
    payload: BaseProcessGuideDto,
    processId: string,
  ): Promise<EstablishmentEntity> {
    const establishmentRepository = manager.getRepository(EstablishmentEntity);
    const establishmentAddressRepository = manager.getRepository(EstablishmentAddressEntity);
    const establishmentContactPersonRepository = manager.getRepository(
      EstablishmentContactPersonEntity,
    );

    const establishment = await establishmentRepository.findOne({
      where: { id: payload.establishment.id },
    });

    if (!establishment) {
      throw new NotFoundException();
    }
    establishment.id = payload.establishment.id;
    establishment.provinceId = payload.establishment.province.id;
    establishment.cantonId = payload.establishment.canton.id;
    establishment.parishId = payload.establishment.parish.id;
    establishment.mainStreet = payload.establishment.mainStreet;
    establishment.numberStreet = payload.establishment.numberStreet;
    establishment.secondaryStreet = payload.establishment.secondaryStreet;
    establishment.referenceStreet = payload.establishment.referenceStreet;
    establishment.latitude = payload.establishment.latitude;
    establishment.longitude = payload.establishment.longitude;

    await establishmentRepository.save(establishment);

    const establishmentAddress = establishmentAddressRepository.create();
    establishmentAddress.establishmentId = payload.establishment.id;
    establishmentAddress.processId = processId;
    establishmentAddress.provinceId = payload.establishment.province.id;
    establishmentAddress.cantonId = payload.establishment.canton.id;
    establishmentAddress.parishId = payload.establishment.parish.id;
    establishmentAddress.mainStreet = payload.establishment.mainStreet;
    establishmentAddress.numberStreet = payload.establishment.numberStreet;
    establishmentAddress.secondaryStreet = payload.establishment.secondaryStreet;
    establishmentAddress.referenceStreet = payload.establishment.referenceStreet;
    establishmentAddress.latitude = payload.establishment.latitude;
    establishmentAddress.longitude = payload.establishment.longitude;

    await establishmentAddressRepository.save(establishmentAddress);

    const establishmentContactPerson = establishmentContactPersonRepository.create();
    establishmentContactPerson.establishmentId = payload.establishment.id;
    establishmentContactPerson.processId = processId;
    establishmentContactPerson.phone = payload.user.phone;
    establishmentContactPerson.secondaryPhone = payload.user.secondaryPhone;
    establishmentContactPerson.email = payload.user.email;

    await establishmentContactPersonRepository.save(establishmentContactPerson);

    return establishment;
  }

  private async saveUser(
    manager: EntityManager,
    payload: BaseProcessGuideDto,
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
    userUpdate.hasDisability = payload.user.hasDisability;
    userUpdate.bloodTypeId = payload.user.bloodType.id;

    await userRepository.save(userUpdate);

    return userUpdate;
  }

  private async saveProcess(
    manager: EntityManager,
    payload: BaseProcessGuideDto,
    user: UserEntity,
  ): Promise<ProcessEntity> {
    const processRepository = manager.getRepository(ProcessEntity);

    const process = processRepository.create();
    process.activityId = payload.process.activity.id;
    process.classificationId = payload.process.classification.id;
    process.categoryId = payload.process.category.id;
    process.professionalTitleId = payload.process.professionalTitle.id;
    process.establishmentId = payload.establishment.id;
    process.type = payload.process.type.id;
    process.driverLicenseId = payload.process.driverLicense.id;
    process.registeredAt = new Date();
    process.startedAt = payload.process.startedAt;
    process.endedAt = payload.process.endedAt;
    if (user.sex?.code === CatalogueUsersSexEnum.female) {
      process.totalWomen = 1;
      if (user.hasDisability) process.totalWomenDisability = 1;
    }
    process.totalMen = 1;
    if (user.hasDisability) process.totalMenDisability = 1;

    return await processRepository.save(process);
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

      const typeVehicleRegistration = (await this.catalogueService.findCache()).find(
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

      const typeDocumentVehicleInspection = (await this.catalogueService.findCache()).find(
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

      const typeAccidentPolicy = (await this.catalogueService.findCache()).find(
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
}
