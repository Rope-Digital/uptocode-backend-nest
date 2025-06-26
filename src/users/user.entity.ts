import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Project } from '../project/project.entity';
import { OneToMany } from 'typeorm/decorator/relations/OneToMany';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    FirstName: string;

    @Column()
    LastName: string;

    @Column()
    UserName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    resetToken: string;

    @Column({ nullable: true, type: 'timestamp' })
    resetTokenExpiration: Date | null;

    @OneToMany(() => Project, (project) => project.user)
    projects: Project[];

}
