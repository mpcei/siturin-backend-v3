import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RegulationItemEntity } from './regulation-item.entity';

@Entity('regulation_sections', { schema: 'core' })
export class RegulationSectionEntity {
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
    comment: 'Fecha de la ultima actualizacion del registro',
  })
  updatedAt: Date;

  @Column({
    name: 'name',
    type: 'varchar',
    comment: 'Nombre de la sección de la normativa',
  })
  name: string;

  @Column({
    nullable: true,
    name: 'validation_type',
    type: 'enum',
    enum: ['REQUIRED_ITEMS', 'SCORE_BASED', 'MINIMUM_ITEMS'],
    comment: 'Tipo de validación por sección de normativa',
  })
  validationType: string | null;

  @Column({
    name: 'minimum_items',
    type: 'int',
    nullable: true,
    comment: 'Número mínimo requerido de items seleccionados',
  })
  minimumItems: number;

  @Column({
    name: 'sort',
    type: 'int',
    comment: 'Orden en el que el usuario visualizará las secciones de la normativa',
  })
  sort: number;

  @Column({ name: 'model_id', type: 'varchar', comment: '' })
  modelId: string;

  @Column({
    name: 'is_adventure_requirement',
    type: 'boolean',
    comment: 'Identificador si la sección pertenece al tipo aventura',
    default: false,
  })
  isAdventureRequirement: boolean;

  @Column({
    name: 'is_protected_area',
    type: 'boolean',
    comment: 'Identificador si la sección pertenece al tipo área protegida',
    default: false,
  })
  isProtectedArea: boolean;

  @Column({
    name: 'enabled',
    type: 'boolean',
    comment: 'Determina si la sección está activo o no',
  })
  enabled: boolean;

  @OneToMany(() => RegulationItemEntity, (item) => item.regulationSection)
  items: RegulationItemEntity[];

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
