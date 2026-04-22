import {
  BeforeInsert,
  BeforeUpdate,
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
import { CadastreStateEntity, ProcessEntity } from '@modules/core/entities';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

@Entity('cadastres', { schema: 'core' })
export class CadastreEntity {
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
  @OneToMany(() => CadastreStateEntity, (entity) => entity.cadastre)
  cadastreStates: CadastreEntity[];

  @OneToOne(() => CadastreStateEntity, (entity) => entity.cadastre)
  cadastreState: CadastreStateEntity;

  /** Inverse Relationship **/
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

  /** Foreign Keys **/
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
