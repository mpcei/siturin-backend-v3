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
import { UserEntity } from '@auth/entities';
import { InternalUserEntity } from '@modules/core/entities/internal-user.entity';
import { ZoneEntity } from '@modules/core/entities/zone.entity';

@Entity('internal_zonal_users', { schema: 'core' })
export class InternalZonalUserEntity {
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

  @ManyToOne(() => ZoneEntity, { nullable: true })
  @JoinColumn({ name: 'zone_id' })
  zone: ZoneEntity;
  @Column({
    type: 'uuid',
    name: 'zone_id',
    nullable: true,
    comment: '',
  })
  zoneId: string;

  /** Columns **/
  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
