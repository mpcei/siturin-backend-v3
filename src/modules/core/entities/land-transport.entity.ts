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
import { ProcessEntity } from '@modules/core/entities/process.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

@Entity('land_transports', { schema: 'core' })
export class LandTransportEntity {
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
  @JoinColumn({ name: 'type_id' })
  type: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'type_id',
    nullable: true,
    comment: '',
  })
  typeId: string;

  /** Columns **/
  @Column({
    name: 'capacity',
    type: 'integer',
    comment: 'Capacidad',
  })
  capacity: number;

  @Column({
    name: 'plate',
    type: 'varchar',
    comment: 'Placa',
  })
  plate: string;

  @Column({
    name: 'registration',
    type: 'varchar',
    comment: 'Matricula',
  })
  registration: string;

  @Column({
    name: 'registration_at',
    type: 'timestamp',
    comment: 'Fecha de Matricula',
  })
  registrationAt: Date;

  @Column({
    name: 'registration_expiration_at',
    type: 'timestamp',
    comment: 'Fecha de caducidad de Matricula',
  })
  registrationExpirationAt: Date;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
