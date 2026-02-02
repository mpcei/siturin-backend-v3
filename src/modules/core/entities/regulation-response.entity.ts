import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { RegulationItemEntity } from './regulation-item.entity';
import { ProcessEntity } from './process.entity';

@Entity('regulation_responses', { schema: 'core' })
export class RegulationResponseEntity {
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
    comment: 'Fecha de la ultima actualizacion del registro',
  })
  updatedAt: Date;

  @ManyToOne(() => ProcessEntity)
  @JoinColumn({ name: 'process_id' })
  process: ProcessEntity;
  @Column({
    name: 'process_id',
    type: 'uuid',
    comment: 'Id del proceso',
  })
  processId: string;

  @ManyToOne(() => RegulationItemEntity, (entity) => entity.regulationResponses)
  @JoinColumn({ name: 'regulation_item_id' })
  regulationItem: RegulationItemEntity;
  @Column({
    name: 'regulation_item_id',
    type: 'uuid',
    comment: 'Id del item de la normativa',
  })
  regulationItemId: string;

  @Column({
    name: 'is_compliant',
    type: 'boolean',
    comment: 'Cumplimiento o incumplimiento del item de la normativa',
  })
  isCompliant: boolean;

  @Column({
    name: 'score',
    type: 'int',
    nullable: true,
    comment: 'Puntaje del item en el momento del registro',
  })
  score: number;
}
