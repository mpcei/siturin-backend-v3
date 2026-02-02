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
import { EstablishmentEntity } from '@modules/core/entities/establishment.entity';
import { DpaEntity } from '@modules/common/dpa/dpa.entity';

@Entity('establishment_address', { schema: 'core' })
export class EstablishmentAddressEntity {
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
  @ManyToOne(() => EstablishmentEntity, { nullable: true })
  @JoinColumn({ name: 'establishment_id' })
  establishment: EstablishmentEntity;
  @Column({
    type: 'uuid',
    name: 'establishment_id',
    nullable: true,
    comment: '',
  })
  establishmentId: string;

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

  @ManyToOne(() => DpaEntity, { nullable: true })
  @JoinColumn({ name: 'province_id' })
  province: DpaEntity;
  @Column({
    type: 'uuid',
    name: 'province_id',
    nullable: true,
    comment: '',
  })
  provinceId: string;

  @ManyToOne(() => DpaEntity, { nullable: true })
  @JoinColumn({ name: 'canton_id' })
  canton: DpaEntity;
  @Column({
    type: 'uuid',
    name: 'canton_id',
    nullable: true,
    comment: '',
  })
  cantonId: string;

  @ManyToOne(() => DpaEntity, { nullable: true })
  @JoinColumn({ name: 'parish_id' })
  parish: DpaEntity;
  @Column({
    type: 'uuid',
    name: 'parish_id',
    nullable: true,
    comment: '',
  })
  parishId: string;

  /** Columns **/
  @Column({
    name: 'is_current',
    type: 'boolean',
    default: true,
    comment: '',
  })
  isCurrent: boolean;

  @Column({
    name: 'main_street',
    type: 'text',
    nullable: true,
    comment: '',
  })
  mainStreet: string;

  @Column({
    name: 'number_street',
    type: 'text',
    nullable: true,
    comment: '',
  })
  numberStreet: string;

  @Column({
    name: 'secondary_street',
    type: 'text',
    nullable: true,
    comment: 'Nombre',
  })
  secondaryStreet: string;

  @Column({
    name: 'reference_street',
    type: 'text',
    nullable: true,
    comment: '',
  })
  referenceStreet: string;

  @Column({
    name: 'latitude',
    type: 'float',
    nullable: true,
    comment: '',
  })
  latitude: number;

  @Column({
    name: 'longitude',
    type: 'float',
    nullable: true,
    comment: '',
  })
  longitude: number;
}
