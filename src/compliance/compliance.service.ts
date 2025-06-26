import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplianceRequest } from './compliance.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceRequest)
    private complianceRepo: Repository<ComplianceRequest>,
  ) {}

  async createComplianceRequest(body: any, files: any, userId: number) {
    const request = this.complianceRepo.create({
      address: body.address,
      councilName: body.councilName,
      belongsToCouncil: body.belongsToCouncil,
      sitePlanPath: files.sitePlan?.[0]?.path,
      floorPlanPath: files.floorPlan?.[0]?.path,
      sectionPlanPath: files.sectionPlan?.[0]?.path,
      elevationPlanPath: files.elevationPlan?.[0]?.path,
      detailedPlanPath: files.detailedPlan?.[0]?.path,
      supportingDocsPath: files.supportingDocs?.[0]?.path,
    });

    return this.complianceRepo.save(request);
  }
}
