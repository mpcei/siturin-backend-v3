import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { PaymentEntity } from '@modules/core/entities/payment.entity';

@Entity('rucs', { schema: 'core' })
export class RucEntity {
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
  @OneToOne(() => PaymentEntity, (entity) => entity.ruc)
  payment: PaymentEntity;

  /** Foreign Keys **/
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

  @ManyToOne(() => CatalogueEntity, { nullable: true })
  @JoinColumn({ name: 'type_id' })
  type: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'type_id',
    nullable: true,
    comment: '',
  })
  typeId: string;

  @ManyToOne(() => CatalogueEntity, { nullable: true })
  @JoinColumn({ name: 'legal_entity_id' })
  legalEntity: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'legal_entity_id',
    nullable: true,
    comment: '',
  })
  legalEntityId: string;

  /** Columns **/
  @Column({
    name: 'main_economic_activity',
    type: 'text',
    nullable: true,
    comment: '',
  })
  mainEconomicActivity: string;

  @Column({
    name: 'legal_representative_identification',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  legalRepresentativeIdentification: string;

  @Column({
    name: 'legal_representative_names',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  legalRepresentativeNames: string;

  @Column({
    name: 'trade_name',
    type: 'text',
    nullable: true,
    comment: '',
  })
  tradeName: string;

  @Column({
    name: 'number',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  number: string;

  @Column({
    name: 'company_registration_number',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  companyRegistrationNumber: string;

  @Column({
    name: 'legal_name',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  legalName: string;

  @Column({
    name: 'last_updated_at',
    type: 'date',
    nullable: true,
    comment: '',
  })
  lastUpdatedAt: Date;

  @Column({
    name: 'activities_started_at',
    type: 'date',
    nullable: true,
    comment: '',
  })
  activitiesStartedAt: Date;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
