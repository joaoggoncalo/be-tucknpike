import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Coach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to the user in the users table.
  @Column({ type: 'uuid' })
  userId: string;

  // Array of gymnast IDs associated with this coach.
  @Column('uuid', { array: true, nullable: true })
  gymnasts: string[];
}
