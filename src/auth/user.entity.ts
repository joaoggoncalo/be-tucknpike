import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  COACH = 'coach',
  GYMNAST = 'gymnast',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  clubName?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
}
