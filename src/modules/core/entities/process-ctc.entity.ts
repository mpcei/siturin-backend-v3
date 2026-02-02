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

@Entity('process_ctc', { schema: 'core' })
export class ProcessCtcEntity {
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
    comment: '',
  })
  processId: string;

  /** Columns **/
  @Column({
    name: 'total_beds',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalBeds: number;

  @Column({
    name: 'total_capacities',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalCapacities: number;

  @Column({
    name: 'total_places',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalPlaces: number;

  @Column({
    name: 'total_rooms',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalRooms: number;

  @Column({
    name: 'total_tables',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalTables: number;

  @Column({
    name: 'has_property_registration_certificate',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasPropertyRegistrationCertificate: boolean;

  @Column({
    name: 'has_technical_report',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasTechnicalReport: boolean;

  @Column({
    name: 'has_statute',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasStatute: boolean;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
