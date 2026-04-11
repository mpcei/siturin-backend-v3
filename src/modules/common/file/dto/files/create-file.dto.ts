import { UserEntity } from '@auth/entities';
import { EntityManager } from 'typeorm';

export class CreateFileDto {
  file: Express.Multer.File;
  modelId: string;
  user: UserEntity;
  typeId?: string;
  folder: string;
  manager?: EntityManager;
}
