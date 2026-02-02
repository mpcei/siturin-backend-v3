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
import { CadastreEntity } from '@modules/core/entities/cadastre.entity';
import { CatalogueEntity } from '@modules/common/catalogue/catalogue.entity';
import { UserEntity } from '@auth/entities';

@Entity('cadastre_states', { schema: 'core' })
export class CadastreStateEntity {
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
  @ManyToOne(() => CadastreEntity, { nullable: true })
  @JoinColumn({ name: 'cadastre_id' })
  cadastre: CadastreEntity;
  @Column({
    type: 'uuid',
    name: 'cadastre_id',
    nullable: true,
    comment: '',
  })
  cadastreId: string;

  @ManyToOne(() => CatalogueEntity, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state: CatalogueEntity;
  @Column({
    type: 'uuid',
    name: 'state_id',
    nullable: true,
    comment: '',
  })
  stateId: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
    comment: '',
  })
  userId: string;

  /** Columns **/
  @Column({
    name: 'is_current',
    type: 'boolean',
    default: true,
    comment: '',
  })
  isCurrent: boolean;

  @Column({
    name: 'id_temp',
    type: 'bigint',
    nullable: true,
    comment: 'Codigo de la tabla migrada',
  })
  idTemp: number;
}
