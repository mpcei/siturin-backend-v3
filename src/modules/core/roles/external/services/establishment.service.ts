import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreRepositoryEnum } from '@modules/core/utils/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { EstablishmentEntity } from '@modules/core/entities';
import { CreateCadastreDto, UpdateCadastreDto } from '@modules/core/roles/external/dto/cadastre';
import { PaginationDto } from '@utils/pagination';
import { PaginateFilterService } from '@utils/pagination/paginate-filter.service';

@Injectable()
export class EstablishmentService {
  private paginateFilterService: PaginateFilterService<EstablishmentEntity>;

  constructor(
    @Inject(CoreRepositoryEnum.ESTABLISHMENT_REPOSITORY)
    private repository: Repository<EstablishmentEntity>,
  ) {
    this.paginateFilterService = new PaginateFilterService(this.repository);
  }

  async create(payload: CreateCadastreDto): Promise<ServiceResponseHttpInterface> {
    const entity = this.repository.create(payload);

    return { data: await this.repository.save(entity) };
  }

  async findAll(params: PaginationDto): Promise<ServiceResponseHttpInterface> {
    return this.paginateFilterService.execute({ params, searchFields: ['tradeName'] });
  }

  async findOne(id: string): Promise<ServiceResponseHttpInterface> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    return { data: entity };
  }

  async update(id: string, payload: UpdateCadastreDto): Promise<ServiceResponseHttpInterface> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    this.repository.merge(entity, payload);

    return { data: await this.repository.save(entity) };
  }

  async remove(id: string): Promise<ServiceResponseHttpInterface> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Registro no encontrado');
    }

    return { data: await this.repository.softRemove(entity) };
  }
}
