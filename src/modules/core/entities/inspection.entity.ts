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
import { InternalUserEntity, ProcessEntity } from '@modules/core/entities';
import { UserEntity } from '@auth/entities';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

@Entity('inspections', { schema: 'core' })
export class InspectionEntity {
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

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
    comment: 'User',
  })
  userId: string;

  /** Columns **/
  @Column({
    name: 'is_current',
    type: 'boolean',
    nullable: true,
    comment: '',
  })
  isCurrent: boolean;

  @Column({
    name: 'inspection_at',
    type: 'timestamp',
    nullable: true,
    comment: '',
  })
  inspectionAt: Date;

  @Column({
    type: 'text',
    name: 'observation',
    nullable: true,
    comment: '',
  })
  observation: string;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
