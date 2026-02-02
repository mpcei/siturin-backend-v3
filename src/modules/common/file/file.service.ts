import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Equal, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import { CommonRepositoryEnum, MessageEnum } from '@utils/enums';
import * as path from 'path';
import { join } from 'path';
import * as fs from 'fs';
import { PaginationDto } from '@utils/pagination';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { FilterFileDto } from './dto';
import { IsArray } from 'class-validator';

@Injectable()
export class FileService {
  constructor(
    @Inject(CommonRepositoryEnum.FILE_REPOSITORY)
    private repository: Repository<FileEntity>,
  ) {}

  async uploadFile(file: Express.Multer.File, modelId: string, typeId: string) {
    const filePath = `uploads/${new Date().getFullYear()}/${new Date().getMonth()}/${file.filename}`;
    const payload = {
      modelId,
      fileName: file.filename,
      extension: path.extname(file.originalname),
      originalName: file.originalname,
      path: filePath,
      size: file.size,
      typeId: typeId,
    };

    const newFile = this.repository.create(payload);

    return await this.repository.save(newFile);
  }

  async uploadFiles(
    files: Array<Express.Multer.File>,
    modelId: string,
    typeIds: string[],
    userId: string,
  ): Promise<FileEntity[]> {
    if (!files?.length) {
      throw new Error('No existen archivos para subir');
    }

    let i = 0;

    if (!Array.isArray(typeIds)) {
      typeIds = [typeIds];
    }

    const saveOperations = files.map((file) => {
      const relativePath = path.relative(process.cwd(), path.join(file.destination, file.filename));

      const payload = {
        modelId,
        userId,
        fileName: file.filename,
        extension: path.extname(file.originalname),
        originalName: file.originalname,
        path: relativePath,
        size: file.size,
        typeId: typeIds[i],
      };

      const newFile = this.repository.create(payload);

      i++;

      return this.repository.save(newFile);
    });

    return await Promise.all(saveOperations);
  }

  async findOne(id: string): Promise<FileEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('El perfil no existe');
    }

    return entity;
  }

  async getPath(id: string): Promise<string> {
    const file = await this.findOne(id);

    const path = join(process.cwd(), 'storage/private', file?.path);

    if (!fs.existsSync(path)) {
      throw new NotFoundException('File not found');
    }

    return path;
  }

  async findByModel(
    modelId: string,
    params?: FilterFileDto,
  ): Promise<ServiceResponseHttpInterface> {
    //Pagination & Filter by search
    if (params && params?.limit > 0 && params?.page >= 0) {
      return await this.paginateAndFilter(modelId, params);
    }

    //All
    const data = await this.repository.findAndCount({
      relations: { type: true },
      where: { modelId },
    });

    return { pagination: { totalItems: data[1], limit: 10 }, data: data[0] };
  }

  private async paginateAndFilter(
    modelId: string,
    params: FilterFileDto,
  ): Promise<ServiceResponseHttpInterface> {
    let where: FindOptionsWhere<FileEntity> | FindOptionsWhere<FileEntity>[];

    let { page, search } = params;
    const { limit } = params;

    where = [];
    where.push({ modelId: Equal(modelId) });

    if (search) {
      search = search.trim();
      page = 0;
      where = [];
      where.push({
        originalName: ILike(`%${search}%`),
        modelId: Equal(modelId),
      });
    }

    const response = await this.repository.findAndCount({
      relations: { type: true },
      where,
      take: limit,
      skip: PaginationDto.getOffset(limit, page),
    });

    return {
      pagination: { limit, totalItems: response[1] },
      data: response[0],
    };
  }

  async remove(id: string): Promise<any> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(MessageEnum.NOT_FOUND);
    }

    if (entity?.fileName) {
      try {
        fs.unlinkSync(join(process.cwd(), 'storage/private', entity.path));
        return await this.repository.softRemove(entity);
      } catch (err) {
        console.error('Something wrong happened removing the file', err);
      }
    }
  }
}
