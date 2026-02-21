import { UserEntity } from '@auth/entities';

export class CreateFileDto {
  file: Express.Multer.File;
  modelId: string;
  user: UserEntity;
  typeId: string;
  folder: string;
}
