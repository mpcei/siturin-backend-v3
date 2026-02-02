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
import { CategoryEntity, ClassificationEntity } from '@modules/core/entities';

@Entity('category_configurations', { schema: 'core' })
export class CategoryConfigurationEntity {
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

  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
  @Column({
    type: 'uuid',
    name: 'category_id',
    nullable: true,
    comment: '',
  })
  categoryId: string;

  /** Columns **/
  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;

  @Column({
    name: 'min',
    type: 'integer',
    comment: '',
  })
  min: number;

  @Column({
    name: 'max',
    type: 'integer',
    comment: '',
  })
  max: number;

  @Column({
    name: 'sort',
    type: 'integer',
    comment: '',
  })
  sort: number;
}
