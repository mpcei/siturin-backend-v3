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
import { ProcessEntity } from '@modules/core/entities/process.entity';
import { RoomTypeEntity } from '@modules/core/entities/room-type.entity';

@Entity('rooms', { schema: 'core' })
export class RoomEntity {
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
    comment: 'Actividad',
  })
  processId: string;

  @ManyToOne(() => RoomTypeEntity, { nullable: true })
  @JoinColumn({ name: 'room_type_id' })
  roomType: RoomTypeEntity;
  @Column({
    type: 'uuid',
    name: 'room_type_id',
    nullable: true,
    comment: 'Tipo de habitacion',
  })
  roomTypeId: string;

  /** Columns **/
  @Column({
    name: 'total_beds',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalBeds: number;

  @Column({
    name: 'total_rooms',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalRooms: number;

  @Column({
    name: 'total_places',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  totalPlaces: number;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
