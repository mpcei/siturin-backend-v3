import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthRepositoryEnum } from '@utils/enums';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import {
  AssignmentEntity,
  CadastreEntity,
  InactivationCauseEntity,
  ProcessEntity,
  RucEntity,
} from '@modules/core/entities';
import { UserEntity } from '@auth/entities';

@Injectable()
export class InternalPdfSql {
  constructor(
    @Inject(CoreRepositoryEnum.CADASTRE_REPOSITORY)
    private readonly cadastreRepository: Repository<CadastreEntity>,
    @Inject(AuthRepositoryEnum.USER_REPOSITORY)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(CoreRepositoryEnum.RUC_REPOSITORY)
    private readonly rucRepository: Repository<RucEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private readonly processRepository: Repository<ProcessEntity>,
    @Inject(CoreRepositoryEnum.ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepositoryRepository: Repository<AssignmentEntity>,
    @Inject(CoreRepositoryEnum.INACTIVATION_CAUSE_REPOSITORY)
    private readonly inactivationCauseRepository: Repository<InactivationCauseEntity>,
  ) {}

  async findUsers(): Promise<any> {
    const users = await this.userRepository.createQueryBuilder('users').getRawMany();

    return {
      users,
    };
  }

  async findRegistrationCertificate(cadastreId: string): Promise<any> {
    const cadastre = await this.cadastreRepository.findOne({
      relations: {
        process: {
          activity: true,
          classification: true,
          category: true,
          inactivationCauseType: true,
          establishmentAddress: { province: { zone: true }, canton: true, parish: true },
          establishment: { ruc: { type: true } },
          establishmentContactPerson: true, //suspencion, update
          inactivationCauses: true,
          assignment: { internalUser: { user: true } },
        },
        cadastreState: true,
      },

      where: { id: cadastreId },
      order: {
        cadastreState: { isCurrent: 'desc' },
        process: {
          establishmentAddress: { isCurrent: 'desc' },
          establishmentContactPerson: { isCurrent: 'desc' },
        },
      },
    });

    console.log(cadastre);
    return {
      cadastre,
      inactivationCauses: cadastre?.process.inactivationCauses, //inactivacion
      internalUser: cadastre?.process.assignment.internalUser.user, //suspension, update
      activity: cadastre?.process.activity,
      classification: cadastre?.process.classification,
      category: cadastre?.process.category,
      inactivationCauseType: cadastre?.process.inactivationCauseType,
      establishmentAddress: cadastre?.process.establishmentAddress,
      zone: cadastre?.process.establishmentAddress.province.zone,
      canton: cadastre?.process.establishmentAddress.canton,
      parish: cadastre?.process.establishmentAddress.parish,
      province: cadastre?.process.establishmentAddress.province,
      establishment: cadastre?.process.establishment,
      ruc: cadastre?.process.establishment.ruc,
      establishmentContactPerson: cadastre?.process.establishmentContactPerson,
      registeredAt: cadastre?.process.registeredAt,
      //
    };
  }

  async findRegistrationCertificateGuide(cadastreId: string): Promise<any> {
    const cadastre = await this.cadastreRepository.findOne({
      relations: {
        process: {
          establishment: {
            ruc: { user: true, type: true },
            credentials: { classification: true },
            protectedAreas: true,
            adventureModalities: true,
          },
        },
        state: true,
      },

      where: { id: cadastreId },
    });

    return {
      cadastre,
      user: cadastre?.process.establishment.ruc.user,
      classifications: cadastre?.process.establishment.credentials,
      protectedAreas: cadastre?.process.establishment.protectedAreas,
      adventureModalities: cadastre?.process.establishment.adventureModalities,
    };
  }

  async findRegisterInactivation(cadastreId: string): Promise<any> {
    const cadastre = await this.cadastreRepository.findOne({
      relations: {
        process: {
          establishment: { ruc: true, province: { zone: true }, canton: true, parish: true },
          activity: true,
          establishmentAddress: true,
          establishmentContactPerson: true,
          credentials: { classification: true, category: true },
          inactivationCauseType: true,
          inactivationCauses: true,
        },
      },
      where: { id: cadastreId },
    });

    return {
      cadastre,
      inactivationCauses: cadastre?.process.inactivationCauses,
      activity: cadastre?.process.activity,
      classifications: cadastre?.process.credentials
        .map((item) => item.classification.name)
        .join(', '),
      categories: cadastre?.process.credentials.map((item) => item.category.name).join(', '),
      inactivationCauseType: cadastre?.process.inactivationCauseType,
      zone: cadastre?.process.establishment.province.zone,
      canton: cadastre?.process.establishment.canton,
      parish: cadastre?.process.establishment.parish,
      province: cadastre?.process.establishment.province,
      establishment: cadastre?.process.establishment,
      ruc: cadastre?.process.establishment.ruc,
      registeredAt: cadastre?.process.registeredAt,
    };
  }

  async findRegisterUpdate(cadastreId: string): Promise<any> {
    const cadastre = await this.cadastreRepository.findOne({
      relations: {
        process: {
          activity: true,
          classification: true,
          category: true,
          inactivationCauseType: true,
          establishmentAddress: { province: { zone: true }, canton: true, parish: true },
          establishment: { ruc: { type: true } },
          establishmentContactPerson: true, //suspencion, update
          assignment: { internalUser: { user: true } },
        },
        cadastreState: true,
      },

      where: { id: cadastreId },
      order: {
        cadastreState: { isCurrent: 'desc' },
        process: {
          establishmentAddress: { isCurrent: 'desc' },
          establishmentContactPerson: { isCurrent: 'desc' },
        },
      },
    });

    return {
      cadastre,
      internalUser: cadastre?.process.assignment.internalUser.user, //suspension, update
      activity: cadastre?.process.activity,
      classification: cadastre?.process.classification,
      category: cadastre?.process.category,
      inactivationCauseType: cadastre?.process.inactivationCauseType,
      establishmentAddress: cadastre?.process.establishmentAddress,
      zone: cadastre?.process.establishmentAddress.province.zone,
      canton: cadastre?.process.establishmentAddress.canton,
      parish: cadastre?.process.establishmentAddress.parish,
      province: cadastre?.process.establishmentAddress.province,
      establishment: cadastre?.process.establishment,
      ruc: cadastre?.process.establishment.ruc,
      establishmentContactPerson: cadastre?.process.establishmentContactPerson,
      registeredAt: cadastre?.process.registeredAt,
      //
    };
  }

  async findRegisterSuspension(cadastreId: string): Promise<any> {
    const cadastre = await this.cadastreRepository.findOne({
      relations: {
        process: {
          activity: true,
          classification: true,
          category: true,
          inactivationCauseType: true,
          establishmentAddress: { province: { zone: true }, canton: true, parish: true },
          establishment: { ruc: { type: true } },
          establishmentContactPerson: true, //suspencion, update
          assignment: { internalUser: { user: true } },
        },
        cadastreState: true,
      },

      where: { id: cadastreId },
      order: {
        cadastreState: { isCurrent: 'desc' },
        process: {
          establishmentAddress: { isCurrent: 'desc' },
          establishmentContactPerson: { isCurrent: 'desc' },
        },
      },
    });

    return {
      cadastre,
      internalUser: cadastre?.process.assignment.internalUser.user, //suspension, update
      activity: cadastre?.process.activity,
      classification: cadastre?.process.classification,
      category: cadastre?.process.category,
      inactivationCauseType: cadastre?.process.inactivationCauseType,
      establishmentAddress: cadastre?.process.establishmentAddress,
      zone: cadastre?.process.establishmentAddress.province.zone,
      canton: cadastre?.process.establishmentAddress.canton,
      parish: cadastre?.process.establishmentAddress.parish,
      province: cadastre?.process.establishmentAddress.province,
      establishment: cadastre?.process.establishment,
      ruc: cadastre?.process.establishment.ruc,
      establishmentContactPerson: cadastre?.process.establishmentContactPerson,
      registeredAt: cadastre?.process.registeredAt,
    };
  }
}
