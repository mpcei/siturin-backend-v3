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
import { EstablishmentEntity } from '@modules/core/entities/establishment.entity';

@Entity('adventure_tourism_modalities', { schema: 'core' })
export class AdventureTourismModalityEntity {
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
  @ManyToOne(() => ProcessEntity)
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    type: 'uuid',
    name: 'process_id',
    comment: '',
  })
  processId: string;

  @ManyToOne(() => EstablishmentEntity, { nullable: true })
  @JoinColumn({ name: 'establishment_id' })
  establishment: EstablishmentEntity;
  @Column({
    type: 'uuid',
    name: 'establishment_id',
    nullable: true,
    comment: '',
  })
  establishmentId: string;

  /** Columns **/
  @Column({
    name: 'className',
    type: 'varchar',
    comment: 'Nombre Clase de modalidad: agua, aire o tierra',
  })
  className: string;

  @Column({
    name: 'code',
    type: 'varchar',
    comment: 'Codigo de la mdalidad, proviene de la tabla catalogues',
  })
  code: string;

  @Column({
    name: 'name',
    type: 'varchar',
    comment: 'Nombre de la mdalidad, proviene de la tabla catalogues',
  })
  name: string;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
