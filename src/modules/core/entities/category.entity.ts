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
import { ClassificationEntity } from '@modules/core/entities/classification.entity';

@Entity('categories', { schema: 'core' })
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_timestampP',
    comment: 'Fecha de creacion del registro',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_timestampP',
    comment: 'Fecha de actualizacion de la ultima actualizacion del registro',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de eliminacion del registro',
  })
  deletedAt: Date;

  @Column({
    name: 'enabled',
    type: 'boolean',
    default: true,
    comment: 'true=visible, false=no visible',
  })
  enabled: boolean;

  /** Inverse Relationship **/

  /** Foreign Keys **/
  @ManyToOne(() => ClassificationEntity, { nullable: true })
  @JoinColumn({ name: 'classification_id' })
  classification: ClassificationEntity;
  @Column({
    type: 'uuid',
    name: 'classification_id',
    nullable: true,
    comment: 'Clasificacion',
  })
  classificationId: string;

  /** Columns **/
  @Column({
    name: 'code',
    type: 'varchar',
    nullable: true,
    comment: 'Codigo',
  })
  code: string;

  @Column({
    name: 'has_regulation',
    type: 'boolean',
    comment: '',
  })
  hasRegulation: boolean;

  @Column({
    name: 'name',
    type: 'varchar',
    comment: 'Nombre',
  })
  name: string;

  @Column({
    name: 'sort',
    type: 'integer',
    nullable: true,
    comment: 'Orden',
  })
  sort: number;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
