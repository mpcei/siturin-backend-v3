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
import { EstablishmentEntity } from '@modules/core/entities/establishment.entity';
import { ProcessEntity } from '@modules/core/entities/process.entity';
import { ClassificationEntity } from '@modules/core/entities/classification.entity';
import { CategoryEntity } from '@modules/core/entities/category.entity';

@Entity('credentials', { schema: 'guide' })
export class CredentialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_timestampP',
    comment: 'Fecha de creacion del registro',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_timestampP',
    comment: 'Fecha de actualizacion de la ultima actualizacion del registro',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
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
  @ManyToOne(() => EstablishmentEntity)
  @JoinColumn({ name: 'establishment_id' })
  establishment: EstablishmentEntity;
  @Column({
    type: 'uuid',
    name: 'establishment_id',
    nullable: true,
    comment: 'Establecimiento asociado al guía',
  })
  establishmentId: string;

  @ManyToOne(() => ProcessEntity)
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    type: 'uuid',
    name: 'process_id',
    comment: 'Id del trámite',
  })
  processId: string;

  @ManyToOne(() => ClassificationEntity)
  @JoinColumn({ name: 'classification_id' })
  classification: ClassificationEntity;
  @Column({
    type: 'uuid',
    name: 'classification_id',
    comment: '',
  })
  classificationId: string;

  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
  @Column({
    type: 'uuid',
    name: 'category_id',
    comment: '',
  })
  categoryId: string;

  /** Columns **/
  @Column({
    name: 'started_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'Fecha de inicio de vigencia de la clasificacion',
  })
  startedAt: Date;

  @Column({
    name: 'ended_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'Fecha de fin de vigencia de la clasificacion',
  })
  endedAt: Date;

  @Column({
    name: 'state_code',
    type: 'varchar',
    nullable: true,
    comment: 'Codigo del estado de la credencial. Proviene de catalago',
  })
  stateCode: string;

  @Column({
    name: 'state_name',
    type: 'varchar',
    nullable: true,
    comment: 'Nombre del estado de la credencial. Proviene de catalago. Ejemplo: Caducado Inactivo',
  })
  stateName: string;
}
