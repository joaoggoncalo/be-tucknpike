import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Gymnast {
  // Use the user's ID as the primary key.
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  // Array of training IDs associated with this gymnast.
  @Column('uuid', { array: true, nullable: true })
  trainingIds: string[];

  // Array of coach IDs associated with this gymnast.
  @Column('uuid', { array: true, nullable: true })
  coaches: string[];

  @Column({ type: 'date', nullable: true })
  birthdate: Date;
}
