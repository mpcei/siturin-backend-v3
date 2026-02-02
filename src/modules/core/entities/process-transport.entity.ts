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

@Entity('process_transports', { schema: 'core' })
export class ProcessTransportEntity {
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

  @ManyToOne(() => CatalogueEntity, { nullable: true })
  @JoinColumn({ name: 'airline_type_id' })
  airlineType: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'airline_type_id',
    nullable: true,
    comment: '',
  })
  airlineTypeId: string;

  /** Columns **/
  @Column({
    name: 'certified',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  certified: boolean;

  @Column({
    name: 'certified_code',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  certifiedCode: string;

  @Column({
    name: 'certified_issue_at',
    type: 'date',
    nullable: true,
    comment: '',
  })
  certifiedIssueAt: Date;

  @Column({
    name: 'certified_expiration_at',
    type: 'date',
    nullable: true,
    comment: '',
  })
  certifiedExpirationAt: Date;

  @Column({
    name: 'total_units',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalUnits: number;

  @Column({
    name: 'total_seats',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalSeats: number;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
