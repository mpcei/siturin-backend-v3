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
import { ProcessEntity } from '@modules/core/entities/process.entity';
import { InternalUserEntity } from '@modules/core/entities/internal-user.entity';
import { UserEntity } from '@auth/entities';

@Entity('juridical_persons', { schema: 'core' })
export class JuridicalPersonEntity {
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
  internalUser: UserEntity;
  @Column({
    type: 'uuid',
    name: 'internal_user_id',
    nullable: true,
    comment: '',
  })
  internalUserId: string;

  /** Columns **/
  @Column({
    name: 'code',
    type: 'varchar',
    comment: '',
  })
  code: string;

  @Column({
    name: 'name',
    type: 'varchar',
    comment: '',
  })
  name: string;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
