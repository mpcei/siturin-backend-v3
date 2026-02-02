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
import { InternalUserEntity } from '@modules/core/entities/internal-user.entity';
import { UserEntity } from '@auth/entities';
import { DpaEntity } from '@modules/common/dpa/dpa.entity';

@Entity('internal_dpa_users', { schema: 'core' })
export class InternalDpaUserEntity {
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
  @ManyToOne(() => InternalUserEntity, { nullable: true })
  @JoinColumn({ name: 'internal_user_id' })
  internalUser: UserEntity;
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
    name: 'has_process',
    type: 'boolean',
    default: false,
    comment: '',
  })
  hasProcess: boolean;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
