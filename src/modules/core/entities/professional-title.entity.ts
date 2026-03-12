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

@Entity('professional_titles', { schema: 'guide' })
export class ProfessionalTitleEntity {
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
  @ManyToOne(() => EstablishmentEntity)
  @JoinColumn({ name: 'establishment_id' })
  establishment: EstablishmentEntity;
  @Column({
    type: 'uuid',
    name: 'establishment_id',
    nullable: true,
    comment: 'Establecimiento asociado al guía',
  })
  establishmentId: string;

  /** Columns **/
  @Column({
    name: 'name',
    type: 'varchar',
    comment: 'Nombre del titulo',
  })
  name: string;

  @Column({
    name: 'register_number',
    type: 'varchar',
    nullable: true,
    comment: 'Numero de registro del titulo',
  })
  registerNumber: string;

  @Column({
    name: 'register_date',
    type: 'timestamptz',
    nullable: true,
    comment: 'Fecha de registro del titulo',
  })
  registerDate: Date;

  @Column({
    name: 'institution_name',
    type: 'varchar',
    nullable: true,
    comment: 'Institucion emisira del titulo',
  })
  institutionName: string;

  @Column({
    name: 'level_code',
    type: 'varchar',
    comment: 'Codigo del nivel del titulo. Proviene de catalago',
  })
  levelCode: string;

  @Column({
    name: 'level_name',
    type: 'varchar',
    comment: 'Nombre del nivel del titulo. Proviene de catalago. Ejemplo: Tercer Nivel',
  })
  levelName: string;
}
