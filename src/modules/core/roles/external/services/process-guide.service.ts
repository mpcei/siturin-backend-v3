import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { CatalogueUsersSexEnum, ConfigEnum } from '@utils/enums';
import { ResponseHttpInterface } from '@utils/interfaces';
import { EstablishmentEntity, ProcessEntity } from '@modules/core/entities';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { UserEntity } from '@auth/entities';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import { BaseProcessGuideDto } from '@modules/core/roles/external/dto/process-guide';
import { ProcessGuideEntity } from '@modules/core/entities/process-guide.entity';
import { CatalogueProcessGuidesCodeEnum } from '@modules/core/utils/enums';
import { FileService } from '@modules/common/file/file.service';
import { AdventureModalityEntity } from '@modules/core/entities/adventure-modality.entity';

@Injectable()
export class ProcessGuideService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly fileService: FileService,
    private readonly emailService: EmailService,
    private readonly processService: ProcessService,
  ) {}

  async createRegistration(
    payload: BaseProcessGuideDto,
    user: UserEntity,
    files: Express.Multer.File[],
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const establishment = await this.saveEstablishment(manager, payload);
      const userUpdate = await this.saveUser(manager, payload, user);
      const process = await this.saveProcess(manager, payload, userUpdate);
      const processGuide = await this.saveProcessGuide(manager, user, files, payload, process);
      //await this.saveFiles(manager, user, files);

      return {
        data: null,
        title:
          'El certificado de registro de turismo ha sido enviado a la cuenta de correo electrónico registrado y en la plataforma SITURIN, en la sección de descargas.',
        message:
          'Recuerde que puede solicitar la primera inspección, ingresando al sistema SITURIN antes de los 84 días calendario, contados a partir de la emisión del certificado de registro',
      };
    });
  }

  private async saveEstablishment(
    manager: EntityManager,
    payload: BaseProcessGuideDto,
  ): Promise<EstablishmentEntity> {
    const establishmentRepository = manager.getRepository(EstablishmentEntity);
    // const establishmentAddressRepository = manager.getRepository(EstablishmentAddressEntity);

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
    console.log(establishment);

    /*const establishmentAddress = establishmentAddressRepository.create();
    establishmentAddress.establishmentId = payload.establishment.id;
    establishmentAddress.provinceId = payload.establishment.provinceId;
    establishmentAddress.cantonId = payload.establishment.cantonId;
    establishmentAddress.parishId = payload.establishment.parishId;
    establishmentAddress.mainStreet = payload.establishment.mainStreet;
    establishmentAddress.numberStreet = payload.establishment.numberStreet;
    establishmentAddress.secondaryStreet = payload.establishment.secondaryStreet;
    establishmentAddress.referenceStreet = payload.establishment.referenceStreet;
    establishmentAddress.latitude = payload.establishment.latitude;
    establishmentAddress.longitude = payload.establishment.longitude;

    await establishmentAddressRepository.save(establishmentAddress);*/

    return establishment;
  }

  private async saveUser(
    manager: EntityManager,
    payload: BaseProcessGuideDto,
    user: UserEntity,
  ): Promise<UserEntity> {
    const userRepository = manager.getRepository(UserEntity);
    // const establishmentContactPersonRepository = manager.getRepository(
    //   EstablishmentContactPersonEntity,
    // );
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

    /*const establishmentContactPerson = establishmentContactPersonRepository.create();
    establishmentContactPerson.establishmentId = payload.establishment.id;
    establishmentContactPerson.phone = payload.user.phone;
    establishmentContactPerson.secondaryPhone = payload.user.secondaryPhone;
    establishmentContactPerson.email = payload.user.email;

    await establishmentContactPersonRepository.save(establishmentContactPerson);*/

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
    process.establishmentId = payload.establishment.id;
    process.type = payload.process.type.id;
    process.registeredAt = new Date();
    process.startedAt = payload.process.startedAt;
    process.endedAt = payload.process.endedAt;
    console.log(user);
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
      }

      //Guardar modalidades de aventura
      if (
        item.requirement.code === CatalogueProcessGuidesCodeEnum.modality_adventure &&
        item.value === 'true'
      ) {
        for (const item of payload.adventureModalities) {
          const adventureModality = AdventureModalityRepository.create();
          adventureModality.processId = process.id;
          adventureModality.establishmentId = payload.establishment.id;
          adventureModality.modalityCode = item.modalityCode;
          adventureModality.modalityName = item.modalityName;
          adventureModality.modalityCertificateCode = item.modalityCertificateCode;
          adventureModality.modalityCertificateName = item.modalityCertificateName;

          const adventureModalitySave = await AdventureModalityRepository.save(adventureModality);

          await this.saveFile(
            manager,
            user,
            files,
            adventureModalitySave.id,
            adventureModalitySave.modalityCode,
          );
        }
      }

      //Guardar modalidades idioma
      if (
        item.requirement.code === CatalogueProcessGuidesCodeEnum.certification_language &&
        item.value === 'true'
      ) {
      }

      //Guardar modalidades
      if (
        item.requirement.code === CatalogueProcessGuidesCodeEnum.modality_adventure_guide &&
        item.value === 'true'
      ) {
      }

      //Guardar los files
    }

    return true;
  }

  private async saveFile(
    manager: EntityManager,
    user: UserEntity,
    files: Express.Multer.File[],
    modelId: string,
    id: string,
  ): Promise<boolean> {
    const file = files.find((item) => item.filename === id);
    if (!file) {
      return true;
    }
    await this.fileService.uploadProcessFile({
      file,
      manager,
      user,
      modelId,
      activity: 'guide',
      ruc: user.identification,
    });
    return true;
  }
}
