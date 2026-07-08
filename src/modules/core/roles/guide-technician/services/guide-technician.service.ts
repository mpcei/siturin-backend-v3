import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ResponseHttpInterface, ServiceResponseHttpInterface } from '@utils/interfaces';
import { AssignmentEntity, CadastreEntity, ProcessEntity } from '@modules/core/entities';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';
import { FileEntity } from '@modules/common/file/file.entity';
import { UserEntity } from '@auth/entities';
import { PaginationDto } from '@utils/pagination';

@Injectable()
export class GuideTechnicianService {
  private paginateFilterService: PaginateFilterService<CadastreEntity>;

  constructor(
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private processRepository: Repository<ProcessEntity>,
    @Inject(CoreRepositoryEnum.ASSIGNMENT_REPOSITORY)
    private assignmentRepository: Repository<AssignmentEntity>,
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
          establishment: { ruc: true, establishmentContactPerson: true, credentials: true },
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
}
