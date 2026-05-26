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

@Entity('adventure_modalities', { schema: 'guide' })
export class AdventureModalityEntity {
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

  /** Columns **/
  @Column({
    name: 'modality_code',
    type: 'varchar',
    comment: 'Codigo de la modalidad. Proviene de catalago',
  })
  modalityCode: string;

  @Column({
    name: 'modality_name',
    type: 'varchar',
    comment: 'Nombre de la modalidad. Proviene de catalago.',
  })
  modalityName: string;

  @Column({
    name: 'modality_certificate_code',
    type: 'varchar',
    nullable: true,
    comment: 'Codigo de la institucion certificadora de la modalidad. Proviene de catalago',
  })
  modalityCertificateCode: string;

  @Column({
    name: 'modality_certificate_name',
    type: 'varchar',
    nullable: true,
    comment: 'Nombre de la institucion certificadora de la modalidad. Proviene de catalago.',
  })
  modalityCertificateName: string;
}
