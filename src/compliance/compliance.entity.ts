import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class ComplianceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.complianceRequests, { eager: true })
  user: User;

  @Column()
  address: string;

  @Column()
  councilName: string;

  @Column({ default: false })
  belongsToCouncil: boolean;

  @Column({ nullable: true })
  projectPath: string; // helpful for audits and linking

  @Column({ nullable: true })
  sitePlanPath: string;

  @Column({ nullable: true })
  floorPlanPath: string;

  @Column({ nullable: true })
  sectionPlanPath: string;

  @Column({ nullable: true })
  elevationPlanPath: string;

  @Column({ nullable: true })
  detailedPlanPath: string;

  @Column({ nullable: true })
  supportingDocsPath: string;

  @Column({ nullable: true, type: 'text' })
  auditResult: string;

  @Column({ nullable: true, type: 'text' })
  finalReportText: string;

  @Column({ nullable: true })
  downloadLink: string;

  @CreateDateColumn()
  createdAt: Date;
}
