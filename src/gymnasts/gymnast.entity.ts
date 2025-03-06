import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Coach } from '../coaches/coach.entity';

@Entity()
export class Gymnast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @ManyToMany(() => Coach, (coach) => coach.gymnasts)
  coaches: Coach[];
}
