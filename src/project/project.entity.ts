import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  uploadPath: string;

  @ManyToOne(() => User, (user) => user.projects)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
