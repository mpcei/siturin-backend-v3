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
import { EstablishmentEntity } from '@modules/core/entities/establishment.entity';
import { ProcessEntity } from '@modules/core/entities/process.entity';

@Entity('establishment_contact_persons', { schema: 'core' })
export class EstablishmentContactPersonEntity {
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

  /** Columns **/
  @Column({
    name: 'is_current',
    type: 'boolean',
    default: true,
    comment: '',
  })
  isCurrent: boolean;

  @Column({
    name: 'identification',
    type: 'varchar',
    nullable: true,
    comment: 'Codigo',
  })
  identification: string;

  @Column({
    name: 'email',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  email: string;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: true,
    comment: 'Nombre',
  })
  name: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  phone: string;

  @Column({
    name: 'secondary_phone',
    type: 'varchar',
    nullable: true,
    comment: '',
  })
  secondaryPhone: string;
}
