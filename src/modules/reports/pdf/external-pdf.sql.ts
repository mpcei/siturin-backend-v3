import { Inject, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { CadastreEntity } from '@modules/core/entities';

@Injectable()
export class ExternalPdfSql {
  constructor(
    @Inject(CoreRepositoryEnum.CADASTRE_REPOSITORY)
    private readonly cadastreRepository: Repository<CadastreEntity>,
  ) {}

  async findRegisterInactivation(cadastreId: string, manager?: EntityManager): Promise<any> {
    console.log('cadastreId', cadastreId);
    let cadastreRepository = this.cadastreRepository;
    if (manager) cadastreRepository = manager.getRepository(CadastreEntity);

    const cadastre = await cadastreRepository.findOne({
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
}
