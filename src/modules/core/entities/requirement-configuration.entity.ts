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
import { ClassificationEntity } from '@modules/core/entities/classification.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

@Entity('requirement_configurations', { schema: 'guide' })
export class RequirementConfigurationEntity {
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
  @ManyToOne(() => ClassificationEntity)
  @JoinColumn({ name: 'classification_id' })
  classification: ClassificationEntity;
  @Column({
    type: 'uuid',
    name: 'classification_id',
    comment: '',
  })
  classificationId: string;

  @ManyToOne(() => CatalogueEntity)
  @JoinColumn({ name: 'requirement_id' })
  requirement: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'requirement_id',
    comment: '',
  })
  requirementId: string;

  /** Columns **/
  @Column({
    name: 'professional_type_code',
    type: 'varchar',
    comment: 'Codigo del tipo de titulo. Proviene de catalago',
  })
  professionalTypeCode: string;

  @Column({
    name: 'professional_type_name',
    type: 'varchar',
    comment: 'Nombre del tipo de titulo. Proviene de catalago. Ejemplo: Conocimiento Afin',
  })
  professionalTypeName: string;

  @Column({
    name: 'sort_register',
    type: 'int',
    nullable: true,
    comment: 'Orden requisitos registro',
  })
  sortRegister: number;

  @Column({
    name: 'enabled_register',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito activo para registro',
  })
  enabledRegister: boolean;

  @Column({
    name: 'required_register',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito para registro de cumplimiento obligatorio',
  })
  requiredRegister: boolean;

  @Column({
    name: 'sort_renovation',
    type: 'int',
    nullable: true,
    comment: 'Orden requisitos renovacion',
  })
  sortRenovation: number;

  @Column({
    name: 'enabled_renovation',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito activo para renovacion',
  })
  enabledRenovation: boolean;

  @Column({
    name: 'required_renovation',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito para renovacion de cumplimiento obligatorio',
  })
  requiredRenovation: boolean;

  @Column({
    name: 'sort_current_credential',
    type: 'int',
    nullable: true,
    comment: 'Orden requisitos credencial vigente',
  })
  sortCurrentCredential: number;

  @Column({
    name: 'enabled_current_credential',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito activo para credencial vigente',
  })
  enabledCurrentCredential: boolean;

  @Column({
    name: 'required_current_credential',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito para credencial vigente de cumplimiento obligatorio',
  })
  requiredCurrentCredential: boolean;

  @Column({
    name: 'sort_expired_credential',
    type: 'int',
    nullable: true,
    comment: 'Orden requisitos credencial caducada',
  })
  sortExpiredCredential: number;

  @Column({
    name: 'enabled_expired_credential',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito activo para credencial caducada',
  })
  enabledExpiredCredential: boolean;

  @Column({
    name: 'required_expired_credential',
    type: 'boolean',
    nullable: true,
    comment: 'Requisito para credencial caducada de cumplimiento obligatorio',
  })
  requiredExpiredCredential: boolean;
}
