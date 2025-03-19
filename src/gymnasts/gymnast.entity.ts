import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Gymnast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to the user in the users table.
  @Column({ type: 'uuid' })
  userId: string;

  // Array of training IDs associated with this gymnast.
  @Column('uuid', { array: true, nullable: true })
  trainingIds: string[];
}
