import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Coach {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @Column('uuid', { array: true, nullable: true })
  gymnasts: string[];
}
