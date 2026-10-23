import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import {
  InspectionEntity,
  InternalDpaUserEntity,
  InternalUserEntity,
  ProcessEntity,
} from '@modules/core/entities';
import { PaginationDto } from '@utils/pagination';
import { InternalLegacyService } from './internal-legacy.service';
import { AuthRepositoryEnum } from '@utils/enums';
import { UserEntity } from '@auth/entities';
import { RoleEnum } from '@auth/enums';
import { InternalUserDto } from '../dto/internal-user.dto';
import { DpaInternalUserDto } from '../dto/dpa-internal-user.dto';
import { UpdateProcessDto } from '../dto/update-process.dto';

@Injectable()
export class InternalService {
  constructor(
    @Inject(CoreRepositoryEnum.INTERNAL_USER_REPOSITORY)
    private repository: Repository<InternalUserEntity>,
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private processRepository: Repository<ProcessEntity>,
    @Inject(AuthRepositoryEnum.USER_REPOSITORY)
    private userRepository: Repository<UserEntity>,
    @Inject(CoreRepositoryEnum.INTERNAL_DPA_USER_REPOSITORY)
    private internalDpaUserRepository: Repository<InternalDpaUserEntity>,
    @Inject(CoreRepositoryEnum.INSPECTION_REPOSITORY)
    private inspectionRepository: Repository<InspectionEntity>,
    private readonly internalLegacyService: InternalLegacyService,
  ) {}

  async getInternalUsersList(params: PaginationDto) {
    const limit = params.limit || 10;
    const offset = PaginationDto.getOffset(limit, params.page);
    const externalRoleCode = RoleEnum.EXTERNAL;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndMapOne(
        'user.internalUser',
        InternalUserEntity,
        'internalUser',
        'internalUser.user_id = user.id',
      )
      .where('roles.code != :externalRoleCode', { externalRoleCode });

    if (params.search) {
      const searchParam = `%${params.search.trim()}%`;
      queryBuilder.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: searchParam,
      });
    }

    const [data, totalItems] = await queryBuilder
      .orderBy('user.name', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
  async createInternalUser(userId: string) {
    const existing = await this.repository.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }

    const newInternalUser = this.repository.create({
      userId: userId,
      enabled: true,
      isAvailable: false,
    });

    return await this.repository.save(newInternalUser);
  }

  async internalUserAvailable(payload: InternalUserDto) {
    const internalUser = await this.repository.findOne({
      where: {
        id: payload.id,
      },
      relations: {
        user: true,
      },
    });
    if (!internalUser) {
      throw new NotFoundException({
        message: 'Usuario no encontrado',
        error: 'Usuario no encontrado',
      });
    }
    internalUser.isAvailable = payload.isAvailable ?? false;
    const newState = await this.repository.save(internalUser);

    await this.internalLegacyService.updateInternalUser(payload, internalUser.user);

    return newState;
  }

  async findInternalUserDpa(internalUserId: string) {
    const dpaUser = await this.internalDpaUserRepository.find({
      where: { internalUserId: internalUserId },
      relations: {
        dpa: true,
      },
    });
    return dpaUser;
  }

  async createDpaInternaluser(payload: DpaInternalUserDto) {
    const existDpa = await this.internalDpaUserRepository.findOne({
      where: {
        internalUserId: payload.internalUserId,
        dpaId: payload.dpaId,
      },
      withDeleted: true,
    });
    // if (existDpa) {
    //   throw new NotFoundException({
    //     message: 'el registro esta eliminado logicamente',
    //     error: 'Ya existe ese registro',
    //   });
    // }
    const newDpa = this.internalDpaUserRepository.create();
    newDpa.internalUserId = payload.internalUserId;
    newDpa.dpaId = payload.dpaId;
    newDpa.enabled = true;
    newDpa.hasProcess = false;
    return await this.internalDpaUserRepository.save(newDpa);
  }
  async deleteDpaInternaluser(dpaId: string) {
    const existDpa = await this.internalDpaUserRepository.findOne({ where: { id: dpaId } });
    if (!existDpa) {
      throw new NotFoundException({
        message: 'NO existe ese dpa Asignado',
        error: 'Error al Eliminar',
      });
    }
    await this.internalDpaUserRepository.softRemove(existDpa);
  }
  async enabledDpaInternaluser(payload: InternalUserDto) {
    const existDpa = await this.internalDpaUserRepository.findOne({ where: { id: payload.id } });
    if (!existDpa) {
      throw new NotFoundException({
        message: 'NO existe ese dpa Asignado',
        error: 'Error al Eliminar',
      });
    }
    existDpa.enabled = payload.enabled ?? false;

    await this.internalDpaUserRepository.save(existDpa);
  }
  async findAllProcess(params: PaginationDto) {
    const limit = params.limit || 10;
    const offset = PaginationDto.getOffset(limit, params.page);
    const searchTerm = params.search ? `%${params.search.trim()}%` : null;

    const whereCondition = searchTerm
      ? [
          { name: ILike(searchTerm) },
          // { code: ILike(searchTerm) },
        ]
      : {};

    const [data, totalItems] = await this.processRepository.findAndCount({
      where: whereCondition,
      relations: {
        legalEntity: true,
        type: true,
      },
      skip: offset,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      pagination: {
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async updateProcess(payload: UpdateProcessDto) {
    return await this.processRepository.manager.transaction(async (transactionalEntityManager) => {
      const process = await transactionalEntityManager.findOne(ProcessEntity, {
        where: { id: payload.id },
        relations: {
          establishment: true, // Ajusta estos nombres según las propiedades de tu ProcessEntity
          activity: true,
          category: true,
        },
      });

      if (!process) {
        throw new NotFoundException({
          message: 'El trámite no fue encontrado',
          error: 'Proceso no existe',
        });
      }
      process.inspectionExpirationAt = new Date(payload.inspectionDate);
      const updatedProcess = await transactionalEntityManager.save(process);

      const inspection = await transactionalEntityManager.findOne(InspectionEntity, {
        where: {
          processId: updatedProcess.id,
          isCurrent: true,
        },
      });
      if (inspection) {
        inspection.inspectionAt = new Date(payload.inspectionDate);
        await transactionalEntityManager.save(inspection);
      }
      const tradeName = process.establishment?.tradeName;
      const nameActivity = process.activity?.name;
      const nameCategory = process.category?.name;

      if (tradeName && nameActivity && nameCategory) {
        await this.internalLegacyService.updateInspectionDate(
          payload.inspectionDate,
          tradeName,
          nameActivity,
          nameCategory,
        );
      } else {
        console.warn(
          `No se pudo actualizar legacy: Faltan datos de relaciones para el trámite ${process.id}`,
        );
      }

      return updatedProcess;
    });
  }
}
