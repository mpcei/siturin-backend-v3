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
import { DpaEntity } from '@modules/common/dpa/dpa.entity';
import { ProcessEntity } from '@modules/core/entities/process.entity';
import { InternalUserEntity } from '@modules/core/entities/internal-user.entity';
import { UserEntity } from '@auth/entities';
import { ZoneEntity } from '@modules/core/entities/zone.entity';

@Entity('assignments', { schema: 'core' })
export class AssignmentEntity {
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

  @ManyToOne(() => InternalUserEntity, { nullable: true })
  @JoinColumn({ name: 'internal_user_id' })
  internalUser: InternalUserEntity;
  @Column({
    type: 'uuid',
    name: 'internal_user_id',
    nullable: true,
    comment: '',
  })
  internalUserId: string;

  @ManyToOne(() => DpaEntity, { nullable: true })
  @JoinColumn({ name: 'dpa_id' })
  dpa: DpaEntity;
  @Column({
    type: 'uuid',
    name: 'dpa_id',
    nullable: true,
    comment: '',
  })
  dpaId: string;

  /** Columns **/
  @Column({
    name: 'is_current',
    type: 'boolean',
    default: true,
    comment: '',
  })
  isCurrent: boolean;

  @Column({
    name: 'registered_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de registro',
  })
  registeredAt: Date;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
