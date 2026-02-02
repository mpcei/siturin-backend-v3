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

@Entity('process_agencies', { schema: 'core' })
export class ProcessAgencyEntity {
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
  @JoinColumn({ name: 'permanent_physical_space_id' })
  permanentPhysicalSpace: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'permanent_physical_space_id',
    nullable: true,
    comment: '',
  })
  permanentPhysicalSpaceId: string;

  /** Columns **/
  @Column({
    name: 'total_accredited_staff_language',
    type: 'integer',
    comment: '',
  })
  totalAccreditedStaffLanguage: number;

  @Column({
    name: 'percentage_accredited_staff_language',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '',
  })
  percentageAccreditedStaffLanguage: number;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
