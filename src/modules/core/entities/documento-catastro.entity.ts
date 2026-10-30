import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '@auth/entities';
import { FileEntity } from '@modules/common/file/file.entity';

@Entity('documento_catastros', { schema: 'public' })
export class DocumentoCatastroEntity {
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

  /** Inverse Relationship **/
  @OneToOne(() => FileEntity, (entity) => entity.modelId)
  file: FileEntity;

  /** Foreign Keys **/
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
    comment: 'Usuario para saber quien sube el archivo',
  })
  userId: string;

  /** Columns **/
  @Column({
    name: 'year',
    type: 'integer',
    nullable: true,
    comment: 'Anio al que corresponde el archivo',
  })
  year: number;

  @Column({
    name: 'month',
    type: 'integer',
    nullable: true,
    comment: 'Mes al que corresponde el archivo',
  })
  month: number;

  @Column({
    name: 'period',
    type: 'integer',
    nullable: true,
    comment: 'Periodo al que corresponde el archivo',
  })
  period: number;
}
