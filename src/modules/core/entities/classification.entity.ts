import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityEntity } from '@modules/core/entities/activity.entity';
import { ObservationEntity } from '@modules/core/entities/observation.entity';
import { CategoryEntity } from '@modules/core/entities/category.entity';

@Entity('classifications', { schema: 'core' })
export class ClassificationEntity {
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
  @OneToMany(() => CategoryEntity, (entity) => entity.classification)
  categories: CategoryEntity[];

  @OneToMany(() => ObservationEntity, (entity) => entity.modelId)
  observations: ObservationEntity[];

  /** Foreign Keys **/
  @ManyToOne(() => ActivityEntity, { nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity: ActivityEntity;
  @Column({
    type: 'uuid',
    name: 'activity_id',
    nullable: true,
    comment: 'Actividad',
  })
  activityId: string;

  /** Columns **/
  @Column({
    name: 'code',
    type: 'varchar',
    comment: 'Codigo',
  })
  code: string;

  @Column({
    name: 'is_complementary_service',
    type: 'boolean',
    comment: '',
  })
  isComplementaryService: boolean;

  @Column({
    name: 'max_rooms',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  maxRooms: number;

  @Column({
    name: 'max_places',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  maxPlaces: number;

  @Column({
    name: 'min_rooms',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  minRooms: number;

  @Column({
    name: 'min_places',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  minPlaces: number;

  @Column({
    name: 'has_categorization',
    type: 'boolean',
    comment: '',
  })
  hasCategorization: boolean;

  @Column({
    name: 'has_regulation',
    type: 'boolean',
    comment: '',
  })
  hasRegulation: boolean;

  @Column({
    name: 'name',
    type: 'varchar',
    comment: 'Nombre',
  })
  name: string;

  @Column({
    name: 'sort',
    type: 'integer',
    comment: 'Orden',
  })
  sort: number;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
