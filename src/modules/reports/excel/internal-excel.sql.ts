import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ProcessEntity } from '@modules/core/entities';

@Injectable()
export class InternalExcelSql {
  constructor(
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private readonly processRepository: Repository<ProcessEntity>,
  ) {}

  async findProcesses(cadastreId: string): Promise<any> {
    const processes = await this.processRepository.find();

    return {
      processes,
    };
  }
}
