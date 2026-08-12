import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { AssignmentEntity, ProcessEntity } from '@modules/core/entities';

@Injectable()
export class InternalExcelSql {
  constructor(
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private readonly processRepository: Repository<ProcessEntity>,
    @Inject(CoreRepositoryEnum.ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: Repository<AssignmentEntity>,
  ) {}

  async findProcesses(
    userId: string,
    rolCode: string,
    isCurrent: boolean,
  ): Promise<AssignmentEntity[]> {
    return  await this.assignmentRepository.find({
      where: {
        rolCode: rolCode,
        internalUser: { userId: userId },
        isCurrent: isCurrent,
        enabled: true,
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
    });
  }
}
