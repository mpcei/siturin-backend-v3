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

@Entity('languages', { schema: 'guide' })
export class LanguageEntity {
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

  @ManyToOne(() => ProcessEntity)
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    type: 'uuid',
    name: 'process_id',
    comment: 'Id del trámite',
  })
  processId: string;

  /** Columns **/
  @Column({
    name: 'language_code',
    type: 'varchar',
    comment: 'Codigo del idioma. Proviene de catalago',
  })
  languageCode: string;

  @Column({
    name: 'language_name',
    type: 'varchar',
    comment: 'Nombre del idioma. Proviene de catalago',
  })
  languageName: string;

  @Column({
    name: 'level_code',
    type: 'varchar',
    nullable: true,
    comment: 'Codigo del nivel de conocimiento del idioma. Proviene de catalago',
  })
  levelCode: string;

  @Column({
    name: 'level_name',
    type: 'varchar',
    nullable: true,
    comment: 'Nombre del nivel de conocimiento del idioma. Proviene de catalago.',
  })
  levelName: string;

  @Column({
    name: 'mother_language',
    type: 'boolean',
    nullable: true,
    comment: 'Declaracion lengua materna',
  })
  motherLanguage: boolean;
}
