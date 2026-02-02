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
import { RoomEntity } from '@modules/core/entities/room.entity';

@Entity('room_rates', { schema: 'core' })
export class RoomRateEntity {
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
  @ManyToOne(() => RoomEntity, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: RoomEntity;
  @Column({
    type: 'uuid',
    name: 'room_id',
    nullable: true,
    comment: '',
  })
  roomId: string;

  /** Columns **/
  @Column({
    name: 'high_room',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
    comment: '',
  })
  highRoom: string;

  @Column({
    name: 'low_room',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
    comment: '',
  })
  lowRoom: string;

  @Column({
    name: 'high_person',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
    comment: '',
  })
  highPerson: string;

  @Column({
    name: 'low_person',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
    comment: '',
  })
  lowPerson: string;

  @Column({
    name: 'year',
    type: 'integer',
    nullable: true,
    comment: '',
  })
  year: number;

  @Column({
    name: 'declaration_at',
    type: 'timestamp',
    nullable: true,
    comment: '',
  })
  declarationAt: Date;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
