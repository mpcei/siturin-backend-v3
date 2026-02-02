import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { RegulationSectionEntity } from './regulation-section.entity';
import { RegulationResponseEntity } from './regulation-response.entity';

@Entity('regulation_items', { schema: 'core' })
export class RegulationItemEntity {
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
  @OneToMany(() => RegulationResponseEntity, (entity) => entity.regulationItem)
  regulationResponses: RegulationResponseEntity[];

  /** Foreign Keys **/
  @ManyToOne(() => RegulationSectionEntity, (entity) => entity.items)
  @JoinColumn({ name: 'regulation_section_id' })
  regulationSection: RegulationSectionEntity;
  @Column({
    type: 'uuid',
    name: 'regulation_section_id',
    nullable: true,
    comment: '',
  })
  regulationSectionId: string;

  /** Columns **/
  @Column({
    name: 'name',
    type: 'text',
    comment: 'Nombre del item de la normativa',
  })
  name: string;

  @Column({
    name: 'required',
    type: 'boolean',
    comment: 'Campo es requerido o no',
  })
  required: boolean;

  @Column({
    name: 'score',
    type: 'int',
    nullable: true,
    comment: 'Puntaje del item de la normativa',
  })
  score: number;

  @Column({
    name: 'sort',
    type: 'int',
    comment: 'Orden en el que el usuario visualizará los items de la sección',
  })
  sort: number;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
