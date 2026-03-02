import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('zones', { schema: 'core' })
export class ZoneEntity {
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

  /** Columns **/
  @Column({
    name: 'acronym',
    type: 'varchar',
    comment: 'DZ1, DZ6, DZ8 y DZI',
  })
  acronym: string;

  @Column({
    name: 'address',
    type: 'text',
    comment: 'Direccion',
  })
  address: string;

  @Column({
    name: 'email',
    type: 'varchar',
    nullable: true,
    comment: 'Correo',
  })
  email: string;

  @Column({
    name: 'director',
    type: 'varchar',
    comment: 'Director',
  })
  director: string;

  @Column({
    name: 'name',
    type: 'varchar',
    comment: 'Nombre',
  })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    comment: '1,6,8 e Insular',
  })
  code: string;

  @Column({
    name: 'latitude',
    type: 'float',
    nullable: true,
    comment: '',
  })
  latitude: number;

  @Column({
    name: 'longitude',
    type: 'float',
    nullable: true,
    comment: '',
  })
  longitude: number;

  @Column({
    name: 'phone',
    type: 'varchar',
    comment: 'Telefono',
  })
  phone: string;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
