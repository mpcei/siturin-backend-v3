import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RucEntity } from '@modules/core/entities/ruc.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { DpaEntity } from '@modules/common/dpa/dpa.entity';
import { ProcessEntity } from '@modules/core/entities/process.entity';
import { EstablishmentAddressEntity } from '@modules/core/entities/establishment-address.entity';

@Entity('establishments', { schema: 'core' })
export class EstablishmentEntity {
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
  @OneToOne(() => ProcessEntity, (entity) => entity.establishment)
  process: ProcessEntity;

  @OneToMany(() => ProcessEntity, (entity) => entity.establishment)
  processes: ProcessEntity[];

  @OneToOne(() => EstablishmentAddressEntity, (entity) => entity.establishment)
  establishmentAddress: EstablishmentAddressEntity;

  /** Foreign Keys **/
  @ManyToOne(() => RucEntity, { nullable: true })
  @JoinColumn({ name: 'ruc_id' })
  ruc: RucEntity;
  @Column({
    type: 'uuid',
    name: 'ruc_id',
    nullable: true,
    comment: '',
  })
  rucId: string;

  @ManyToOne(() => CatalogueEntity, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'state_id',
    nullable: true,
    comment: '',
  })
  stateId: string;

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
    name: 'number',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  number: string;

  @Column({
    name: 'trade_name',
    type: 'varchar',
    nullable: true,

    comment: '',
  })
  tradeName: string;

  @Column({
    name: 'web_page',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  webPage: string;

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

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
