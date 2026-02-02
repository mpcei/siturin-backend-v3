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

@Entity('sales_representatives', { schema: 'core' })
export class SalesRepresentativeEntity {
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
  @ManyToOne(() => ProcessEntity, { nullable: true })
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    type: 'uuid',
    name: 'process_id',
    nullable: true,
    comment: 'Actividad',
  })
  processId: string;

  /** Columns **/
  @Column({
    name: 'legal_name',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  legalName: string;

  @Column({
    name: 'ruc',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  ruc: string;

  @Column({
    name: 'has_professional_degree',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasProfessionalDegree: boolean;

  @Column({
    name: 'has_contract',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasContract: boolean;

  @Column({
    name: 'has_work_experience',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasWorkExperience: boolean;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable:true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
