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
import { UserEntity } from '@auth/entities';

@Entity('process_states', { schema: 'core' })
export class ProcessStateEntity {
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
    comment: 'solo un estado puede estar vigente (true)',
  })
  enabled: boolean;

  /** Inverse Relationship **/

  /** Foreign Keys **/
  @ManyToOne(() => ProcessEntity)
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    type: 'uuid',
    name: 'process_id',
    comment: 'trámite, para conocer su trazabilidad',
  })
  processId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @Column({
    type: 'uuid',
    name: 'user_id',
    comment: 'Auditoria, para saber quien cambia el estado',
  })
  userId: string;

  /** Columns **/
  @Column({
    name: 'started_at',
    type: 'timestamptz',
    comment: 'Fecha de inicio del estado',
  })
  startedAt: Date;

  @Column({
    name: 'ended_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'Fecha de fin del estado',
  })
  endedAt: Date;

  @Column({
    name: 'state_code',
    type: 'varchar',
    comment: 'Código del estado proviene de Catalogue',
  })
  stateCode: string;

  @Column({
    name: 'state_name',
    type: 'varchar',
    comment: 'Nombre del estado proviene de Catalogue',
  })
  stateName: string;
}
