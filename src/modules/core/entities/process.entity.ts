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
import { ActivityEntity } from '@modules/core/entities/activity.entity';
import { ClassificationEntity } from '@modules/core/entities/classification.entity';
import { CategoryEntity } from '@modules/core/entities/category.entity';
import { EstablishmentEntity } from '@modules/core/entities/establishment.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { EstablishmentAddressEntity } from '@modules/core/entities/establishment-address.entity';
import { EstablishmentContactPersonEntity } from '@modules/core/entities/establishment-contact-person.entity';
import { CadastreEntity } from '@modules/core/entities/cadastre.entity';
import { InspectionEntity } from '@modules/core/entities/inspection.entity';
import { InactivationCauseEntity } from '@modules/core/entities/inactivation-cause.entity';
import { AssignmentEntity } from '@modules/core/entities/assignment.entity';

@Entity('processes', { schema: 'core' })
export class ProcessEntity {
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
  @OneToOne(() => EstablishmentAddressEntity, (entity) => entity.process)
  establishmentAddress: EstablishmentAddressEntity;

  @OneToOne(() => EstablishmentContactPersonEntity, (entity) => entity.process)
  establishmentContactPerson: EstablishmentContactPersonEntity;

  @OneToOne(() => CadastreEntity, (entity) => entity.process)
  cadastre: CadastreEntity;

  @OneToOne(() => InspectionEntity, (entity) => entity.process)
  actualInspection: InspectionEntity;

  @OneToMany(() => InspectionEntity, (entity) => entity.process)
  inspections: InspectionEntity[];

  @OneToMany(() => InactivationCauseEntity, (entity) => entity.process)
  inactivationCauses: InactivationCauseEntity[];

  @OneToOne(() => AssignmentEntity, (entity) => entity.process)
  assignment: AssignmentEntity;

  @OneToMany(() => AssignmentEntity, (entity) => entity.process)
  assignments: AssignmentEntity[];
  /** Foreign Keys **/
  @ManyToOne(() => ActivityEntity, { nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity: ActivityEntity;
  @Column({
    type: 'uuid',
    name: 'activity_id',
    nullable: true,
    comment: '',
  })
  activityId: string;

  @ManyToOne(() => ClassificationEntity, { nullable: true })
  @JoinColumn({ name: 'classification_id' })
  classification: ClassificationEntity;
  @Column({
    type: 'uuid',
    name: 'classification_id',
    nullable: true,
    comment: '',
  })
  classificationId: string;

  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
  @Column({
    type: 'uuid',
    name: 'category_id',
    nullable: true,
    comment: '',
  })
  categoryId: string;

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

  @ManyToOne(() => CatalogueEntity, { nullable: true })
  @JoinColumn({ name: 'local_type_id' })
  localType: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'local_type_id',
    nullable: true,
    comment: '',
  })
  localTypeId: string;

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
  @JoinColumn({ name: 'inactivation_cause_type_id' })
  inactivationCauseType: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'inactivation_cause_type_id',
    nullable: true,
    comment: '',
  })
  inactivationCauseTypeId: string;

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

  /** Columns **/
  @Column({
    name: 'registered_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de la solicitud del registro',
  })
  registeredAt: Date;

  @Column({
    name: 'attended_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de atencion de la solicitud del registro',
  })
  attendedAt: Date;

  @Column({
    name: 'started_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de inicio de la solicitud',
  })
  startedAt: Date;

  @Column({
    name: 'ended_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de finalizacion de la solicitud',
  })
  endedAt: Date;

  @Column({
    name: 'has_tourist_activity_document',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasTouristActivityDocument: boolean;

  @Column({
    name: 'has_person_designation',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasPersonDesignation: boolean;

  @Column({
    name: 'is_protected_area',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  isProtectedArea: boolean;

  @Column({
    name: 'has_protected_area_contract',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasProtectedAreaContract: boolean;

  @Column({
    name: 'inspection_expiration_at',
    type: 'timestamp',
    nullable: true,
    comment: '',
  })
  inspectionExpirationAt: Date;

  @Column({
    name: 'total_men',
    type: 'integer',
    default: 0,
    comment: '',
  })
  totalMen: number;

  @Column({
    name: 'total_women',
    type: 'integer',
    default: 0,
    comment: '',
  })
  totalWomen: number;

  @Column({
    name: 'total_men_disability',
    type: 'integer',
    default: 0,
    comment: '',
  })
  totalMenDisability: number;

  @Column({
    name: 'total_women_disability',
    type: 'integer',
    default: 0,
    comment: '',
  })
  totalWomenDisability: number;

  @Column({
    name: 'has_land_use',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  hasLandUse: boolean;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
