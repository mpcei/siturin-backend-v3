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
import { DpaEntity } from '@modules/common/dpa/dpa.entity';
import { ProfessionalTitleEntity } from '@modules/core/entities/professional-title.entity';

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

  @ManyToOne(() => ProfessionalTitleEntity)
  @JoinColumn({ name: 'professional_title_id' })
  professionalTitle: ProfessionalTitleEntity;
  @Column({
    type: 'uuid',
    name: 'professional_title_id',
    comment: 'Titulo con el que aplica al tramite',
  })
  professionalTitleId: string;

  @ManyToOne(() => DpaEntity)
  @JoinColumn({ name: 'province_id' })
  province: DpaEntity;
  @Column({
    type: 'uuid',
    name: 'province_id',
    nullable: true,
    comment: 'Provincia de ubicacion relacionada al area protegida',
  })
  provinceId: string;

  @ManyToOne(() => DpaEntity)
  @JoinColumn({ name: 'canton_id' })
  canton: DpaEntity;
  @Column({
    type: 'uuid',
    name: 'canton_id',
    nullable: true,
    comment: 'Canton relacionado al curso de guia local',
  })
  cantonId: string;

  /** Columns **/
  @Column({
    name: 'is_pane',
    type: 'boolean',
    comment: 'Tiene acceso al PANE true=si, false=no',
  })
  isPane: boolean;
}
