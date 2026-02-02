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
import { CategoryEntity } from '@modules/core/entities/category.entity';
import { RoomEntity } from '@modules/core/entities/room.entity';
import { RoomTypeEntity } from '@modules/core/entities/room-type.entity';

@Entity('room_capacities', { schema: 'core' })
export class RoomCapacityEntity {
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
  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
  @Column({
    type: 'uuid',
    name: 'category_id',
    nullable: true,
    comment: '',
  })
  categoryId: string;

  @ManyToOne(() => RoomTypeEntity, { nullable: true })
  @JoinColumn({ name: 'room_type_id' })
  roomType: RoomTypeEntity;
  @Column({
    type: 'uuid',
    name: 'room_type_id',
    nullable: true,
    comment: '',
  })
  roomTypeId: string;
  /** Columns **/
  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
