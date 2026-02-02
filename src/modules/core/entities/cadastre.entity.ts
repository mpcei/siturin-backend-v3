import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CadastreStateEntity, ProcessEntity } from '@modules/core/entities';

@Entity('cadastres', { schema: 'core' })
export class CadastreEntity {
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
  @OneToMany(() => CadastreStateEntity, (entity) => entity.cadastre)
  cadastreStates: CadastreEntity[];

  @OneToOne(() => CadastreStateEntity, (entity) => entity.cadastre)
  cadastreState: CadastreStateEntity;

  /** Foreign Keys **/
  @OneToOne(() => ProcessEntity, { nullable: true })
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    type: 'uuid',
    name: 'process_id',
    nullable: true,
    comment: '',
  })
  processId: string;

  /** Columns **/
  @Column({
    name: 'observation',
    type: 'text',
    nullable: true,
    comment: 'Alguna observacion',
  })
  observation: string;

  @Column({
    name: 'register_number',
    type: 'varchar',
    comment: 'Numero de registro',
  })
  registerNumber: string;

  @Column({
    name: 'registered_at',
    type: 'date',
    comment: 'Fecha de registro',
  })
  registeredAt: Date;

  @Column({
    name: 'system_origin',
    type: 'varchar',
    comment: 'Sitema de origin, SIIT, SITURIN V1',
  })
  systemOrigin: string;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'PK de la tabla migrada',
  })
  idTemp: number;

  @Column({
    name: 'id_process',
    type: 'varchar',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idProcess: string;

  @BeforeInsert()
  @BeforeUpdate()
  setRegisteredAt() {
    if (!this.registeredAt) {
      return;
    }

    this.registeredAt = new Date(
      `${this.registeredAt.getUTCFullYear()}-${this.registeredAt.getUTCMonth() + 1}-${this.registeredAt.getUTCDate()}`,
    );
  }
}
