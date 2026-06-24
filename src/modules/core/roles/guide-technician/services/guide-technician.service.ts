import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ResponseHttpInterface } from '@utils/interfaces';
import { CadastreEntity, ProcessEntity } from '@modules/core/entities';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';
import { FileEntity } from '@modules/common/file/file.entity';

@Injectable()
export class GuideTechnicianService {
  private paginateFilterService: PaginateFilterService<CadastreEntity>;

  constructor(
    @Inject(CoreRepositoryEnum.PROCESS_REPOSITORY)
    private processRepository: Repository<ProcessEntity>,
  ) {}

  async findProcessById(processId: string): Promise<ResponseHttpInterface> {
    const process1 = await this.processRepository.findOne({
      where: { id: processId },
      relations: {

        credentials: {
          classification: true,
          geographicArea: true,
          category: true,
        },
        processGuides: { requirement: true },
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

    console.log('process1', process1);

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

      // Land Transport
      .leftJoinAndSelect('process.landTransport', 'landTransport')

      .where('process.id = :id', { id: processId })

      .getOne();

    console.log('process', process);

    return {
      data: process,
      title: 'Solicitud enviada',
      message: 'Recuerde revisar su correo electronico de manera permanente',
    };
  }
}
