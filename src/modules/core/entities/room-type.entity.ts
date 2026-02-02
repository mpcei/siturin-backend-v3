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
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';

@Entity('room_types', { schema: 'core' })
export class RoomTypeEntity {
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
    name: 'is_bed',
    type: 'boolean',
    comment: '',
  })
  isBed: boolean;

  @Column({
    name: 'is_room',
    type: 'boolean',
    comment: '',
  })
  isRoom: boolean;

  @Column({
    name: 'is_place',
    type: 'boolean',
    comment: '',
  })
  isPlace: boolean;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
