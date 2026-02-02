import { RegulationResponseEntity, RegulationSectionEntity } from '@modules/core/entities';
import { Inject, Injectable } from '@nestjs/common';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { Repository } from 'typeorm';
import { RegulationResponseDto } from '@modules/core/shared-core/dto/process/regulation-response.dto';

@Injectable()
export class RegulationResponsesService {
  constructor(
    @Inject(CoreRepositoryEnum.REGULATION_RESPONSE_REPOSITORY)
    private readonly complianceResponseRepository: Repository<RegulationResponseEntity>,
    @Inject(CoreRepositoryEnum.REGULATION_SECTION_REPOSITORY)
    private readonly regulationSectionRepository: Repository<RegulationSectionEntity>,
  ) {}

  async create(payload: RegulationResponseDto) {
    const regulationResponse = this.complianceResponseRepository.create(payload);
    return await this.complianceResponseRepository.save(regulationResponse);
  }

  async createMany(
    processId: string,
    payload: RegulationResponseDto[],
  ): Promise<RegulationResponseEntity[]> {
    const regulationResponses = this.complianceResponseRepository.create(payload);
    return await this.complianceResponseRepository.save(regulationResponses);
  }

  async findComplianceResponsesByProcedureId(
    procedureId: string,
  ): Promise<RegulationSectionEntity[]> {
    const complianceResponse = await this.complianceResponseRepository.findOne({
      where: { process: { id: procedureId } },
      relations: { regulationItem: { regulationSection: true } },
    });

    const modelId = complianceResponse?.regulationItem?.regulationSection?.modelId;

    return await this.regulationSectionRepository
      .createQueryBuilder('section')
      .leftJoin('section.regulationItems', 'item', 'item.isVisible = :isVisible', {
        isVisible: true,
      })
      .leftJoin('item.complianceResponses', 'response', 'response.procedure_id = :procedureId', {
        procedureId,
      })
      .select([
        'section.id',
        'section.name',
        'section.order',
        'item.id',
        'item.name',
        'item.isMandatory',
        'item.order',
        'response.isCompliant',
        'response.score',
      ])
      .where('section.modelId = :modelId', { modelId })
      .orderBy('section.order', 'ASC')
      .addOrderBy('item.order', 'ASC')
      .getMany();
  }
}
