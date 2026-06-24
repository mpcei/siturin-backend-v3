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
import { ProcessEntity } from '@modules/core/entities/process.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { FileEntity } from '@modules/common/file/file.entity';

@Entity('process_guides', { schema: 'core' })
export class ProcessGuideEntity {
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
  @ManyToOne(() => ProcessEntity)
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    type: 'uuid',
    name: 'process_id',
    comment: 'Id del trámite',
  })
  processId: string;

  @ManyToOne(() => CatalogueEntity)
  @JoinColumn({ name: 'requirement_id' })
  requirement: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'requirement_id',
    comment: 'Requisito que proviene de catálogo',
  })
  requirementId: string;

  /** Columns **/
  @Column({
    name: 'value',
    type: 'text',
    comment: 'Valor del requisito',
  })
  value: string;

  @Column({
    name: 'observation',
    type: 'text',
    nullable: true,
    comment: 'Observación el requisito',
  })
  observation: string;

  @Column({
    name: 'state',
    type: 'boolean',
    nullable: true,
    comment: 'Cumple el requisito si-no',
  })
  state: boolean;
}
