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
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { ClassificationEntity } from '@modules/core/entities/classification.entity';

@Entity('activities', { schema: 'core' })
export class ActivityEntity {
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
  @OneToMany(() => ClassificationEntity, (entity) => entity.activity)
  classifications: ClassificationEntity[];

  /** Foreign Keys **/
  @ManyToOne(() => CatalogueEntity, { nullable: true })
  @JoinColumn({ name: 'geographic_area_id' })
  geographicArea: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'geographic_area_id',
    nullable: true,
    comment: 'Continente y Galapagos',
  })
  geographicAreaId: string;

  /** Columns **/
  @Column({
    name: 'code',
    type: 'varchar',
    comment: 'Codigo',
  })
  code: string;

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
