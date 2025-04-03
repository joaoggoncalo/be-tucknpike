import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export interface Exercise {
  name: string;
  completed: boolean | null;
}

export enum TrainingStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  MISSED = 'missed',
  DEFAULT = 'default',
}

@Entity()
export class Training {
  @PrimaryGeneratedColumn('uuid')
  trainingId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('uuid', { nullable: true })
  coachId?: string;

  @Column('jsonb')
  exercises: Exercise[];

  @Column()
  date: Date;

  @Column('jsonb')
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @Column({
    type: 'enum',
    enum: TrainingStatus,
    default: TrainingStatus.DEFAULT,
  })
  status: TrainingStatus;
}
