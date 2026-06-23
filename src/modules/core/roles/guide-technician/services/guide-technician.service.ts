import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ResponseHttpInterface } from '@utils/interfaces';
import { CadastreEntity, ProcessEntity } from '@modules/core/entities';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';

@Injectable()
export class GuideTechnicianService {
  private paginateFilterService: PaginateFilterService<CadastreEntity>;

  constructor(
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private processRepository: Repository<ProcessEntity>,
  ) {}

  async findProcessById(processId: string): Promise<ResponseHttpInterface> {
    const process = await this.processRepository.findOne({
      where: { id: processId },
      relations: {
        credentials: {
          classification: true,
          geographicArea: true,
          category: true,
        },
        processGuide: { requirement: true },
        processStates: true,
        establishment: {
          establishmentContactPerson: true,
          establishmentAddress: true,
          adventureModalities: true,
          languages: true,
          protectedAreas: true,
        },
        landTransport: true,
      },
    });

    return {
      data: process,
      title: 'Solicitud enviada',
      message: 'Recuerde revisar su correo electronico de manera permanente',
    };
  }
}
