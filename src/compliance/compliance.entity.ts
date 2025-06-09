import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ComplianceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  councilName: string;

  @Column({ default: false })
  belongsToCouncil: boolean;

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

  @CreateDateColumn()
  createdAt: Date;
}
