import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { ConfigEnum } from '@utils/enums';
import { ResponseHttpInterface } from '@utils/interfaces';
import { EstablishmentEntity } from '@modules/core/entities';
import { ProcessService } from '@modules/core/shared-core/services/process.service';
import { UserEntity } from '@auth/entities';
import { EmailService } from '@modules/core/shared-core/services/email.service';
import { BaseProcessGuideDto } from '@modules/core/roles/external/dto/process-guide';

@Injectable()
export class ProcessGuideService {
  constructor(
    @Inject(ConfigEnum.PG_DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly processService: ProcessService,
  ) {}

  async createRegistration(
    payload: BaseProcessGuideDto,
    user: UserEntity,
  ): Promise<ResponseHttpInterface> {
    return await this.dataSource.transaction(async (manager) => {
      const establishment = await this.saveEstablishment(manager, payload);
      const userUpdate = await this.saveUser(manager, payload, user);

      //const responseSendEmail = await this.emailService.sendRegistrationCertificateEmail(cadastre);

      // if (responseSendEmail) {
      //   return {
      //     data: cadastre,
      //     title: responseSendEmail.title,
      //     message: responseSendEmail.message,
      //   };
      // }

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

    return user;
  }
}
