import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('consulta_catastros', { schema: 'public' })
export class ConsultaCatastroEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  /** Columns **/
  @Column({
    name: 'ruc',
    type: 'varchar',
    comment: 'ruc del registro',
  })
  ruc: string;

  @Column({
    name: 'number_establishment',
    type: 'varchar',
    comment: 'Numero de establecimiento',
  })
  numberEstablishment: string;

  @Column({
    name: 'trade_name',
    type: 'varchar',
    nullable: true,
    comment: 'Nombre comercial',
  })
  tradeName: string;

  @Column({
    name: 'register_number',
    type: 'varchar',
    nullable: true,
    unique: true,
    comment: 'Numero de registro',
  })
  registerNumber: string;

  @Column({
    name: 'registered_at',
    type: 'varchar',
    nullable: true,
    comment: 'Fecha de registro',
  })
  registeredAt: string;

  @Column({
    name: 'activity',
    type: 'varchar',
    nullable: true,
    comment: 'Actividad del registro',
  })
  activity: string;

  @Column({
    name: 'classification',
    type: 'varchar',
    nullable: true,
    comment: 'Clasificacion del registro',
  })
  classification: string;

  @Column({
    name: 'category',
    type: 'varchar',
    nullable: true,
    comment: 'Categoria del registro',
  })
  category: string;

  @Column({
    name: 'legal_name',
    type: 'varchar',
    nullable: true,
    comment: 'Razón social',
  })
  legalName: string;

  @Column({
    name: 'legal_representative',
    type: 'varchar',
    nullable: true,
    comment: 'Representante Legal',
  })
  legalRepresentative: string;

  @Column({
    name: 'province',
    type: 'varchar',
    nullable: true,
    comment: 'Provincia de la ubicacion del registro',
  })
  province: string;

  @Column({
    name: 'canton',
    type: 'varchar',
    nullable: true,
    comment: 'Canton de la ubicacion del registro',
  })
  canton: string;

  @Column({
    name: 'parish',
    type: 'varchar',
    nullable: true,
    comment: 'Parroquia de la ubicacion del registro',
  })
  parish: string;

  @Column({
    name: 'type_parish',
    type: 'varchar',
    nullable: true,
    comment: 'Tipo de parroquia. Ejemplo: Rural',
  })
  typeParish: string;

  @Column({
    name: 'address',
    type: 'varchar',
    nullable: true,
    comment: 'Dirección de la ubicacion del registro',
  })
  address: string;

  @Column({
    name: 'reference_address',
    type: 'varchar',
    nullable: true,
    comment: 'Referencia de la dirección de la ubicacion del registro',
  })
  referenceAddress: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    nullable: true,
    comment: 'Telefono del registro',
  })
  phone: string;

  @Column({
    name: 'email',
    type: 'varchar',
    nullable: true,
    comment: 'Correo del registro',
  })
  email: string;

  @Column({
    name: 'web_page',
    type: 'varchar',
    nullable: true,
    comment: 'Pagina web del registro',
  })
  webPage: string;

  @Column({
    name: 'state_cadastre',
    type: 'varchar',
    nullable: true,
    comment: 'Estado del registro en el catastro',
  })
  stateCadastre: string;
}
