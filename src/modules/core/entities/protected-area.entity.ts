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
import { DpaEntity } from '@modules/common/dpa/dpa.entity';

@Entity('protected_areas', { schema: 'guide' })
export class ProtectedAreaEntity {
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
    name: 'protected_area_code',
    type: 'varchar',
    comment: 'Codigo del area protegida. Proviene de catalago',
  })
  protectedAreaCode: string;

  @Column({
    name: 'protected_area_name',
    type: 'varchar',
    comment: 'Nombre del area protegida. Proviene de catalago. Ejemplo: PN. Cotopaxi',
  })
  protectedAreaName: string;
}
