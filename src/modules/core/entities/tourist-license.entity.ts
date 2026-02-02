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
import { TouristGuideEntity } from '@modules/core/entities/tourist-guide.entity';

@Entity('tourist_licenses', { schema: 'core' })
export class TouristLicenseEntity {
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
  @ManyToOne(() => TouristGuideEntity, { nullable: true })
  @JoinColumn({ name: 'tourist_guide_id' })
  touristGuide: TouristGuideEntity;
  @Column({
    type: 'uuid',
    name: 'tourist_guide_id',
    nullable: true,
    comment: '',
  })
  touristGuideId: string;

  /** Columns **/
  @Column({
    name: 'code',
    type: 'varchar',
    comment: '',
  })
  code: string;

  @Column({
    name: 'classification',
    type: 'varchar',
    comment: '',
  })
  classification: string;

  @Column({
    name: 'expiration_at',
    type: 'date',
    comment: '',
  })
  expirationAt: Date;

  @Column({
    name: 'issue_at',
    type: 'date',
    comment: '',
  })
  issueAt: Date;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
