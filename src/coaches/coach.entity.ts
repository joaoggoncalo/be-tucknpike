import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Gymnast } from '../gymnasts/gymnast.entity';

@Entity()
export class Coach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @ManyToMany(() => Gymnast, (gymnast) => gymnast.coaches, { cascade: true })
  @JoinTable() // This decorator is used on one side of the relation.
  gymnasts: Gymnast[];
}
