import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceRequest } from './compliance.entity';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { ComplianceReportService } from './compliance-report/compliance-report.service';
import { ComplianceReportController } from './compliance-report/compliance-report.controller';
import { ComplianceRequestService } from './compliance-request.service';
import { ProjectService } from '../project/project.service';
import { Project } from '../project/project.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplianceRequest,
      Project,
      User,
    ]),
  ],
  providers: [
    ComplianceService,
    ComplianceRequestService,
    ComplianceReportService,
    ProjectService,
  ],
  controllers: [
    ComplianceController,
    ComplianceReportController,
  ],
})
export class ComplianceModule {}
