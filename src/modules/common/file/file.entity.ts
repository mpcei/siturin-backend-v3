import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { UserEntity } from '@auth/entities';

@Entity('files', { schema: 'common' })
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Fecha de creacion de la carrera',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Fecha de actualizacion de la carrera',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de eliminacion de la carrera',
  })
  deletedAt: Date;

  @Column({
    name: 'enabled',
    type: 'boolean',
    default: true,
    comment: 'true=visible, false=no visible',
  })
  enabled: boolean;

  @Column({
    name: 'model_id',
    type: 'varchar',
    comment: 'Foreign Key de cualquier otra entidad',
  })
  modelId: string;

  /** Foreign Key **/
  @ManyToOne(() => CatalogueEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'type_id' })
  type: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'type_id',
    nullable: true,
    comment: 'Tipo de documento',
  })
  typeId: string;

  @ManyToOne(() => UserEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
    comment: 'user',
  })
  userId: string;

  /** Columns **/
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    comment: '',
  })
  description: string;

  @Column({
    name: 'extension',
    type: 'varchar',
    comment: 'Extension ex. .pdf, .xlsx',
  })
  extension: string;

  @Column({
    name: 'file_name',
    type: 'varchar',
    comment: 'In storage',
  })
  fileName: string;

  @Column({
    name: 'original_name',
    type: 'varchar',
    comment: '',
  })
  originalName: string;

  @Column({
    name: 'path',
    type: 'varchar',
    comment: '',
  })
  path: string;

  @Column({
    name: 'size',
    type: 'float',
    comment: 'Size file in bytes',
  })
  size: number;
}
