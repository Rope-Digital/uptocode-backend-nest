import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ComplianceReportService } from './compliance-report.service';
import { AuthGuard } from '@nestjs/passport';
import { createHash } from 'crypto';

@UseGuards(AuthGuard('jwt'))
@Controller('compliance-generate/report')
export class ComplianceReportController {
  constructor(private readonly reportService: ComplianceReportService) {}

  @Post()
  async generateReport(
    @Body() body: { projectName: string; councilName: string },
    @Req() req: any,
  ) {
    const userId = req.user.id || req.user.userId;

    const hashed = createHash('sha256')
      .update(userId.toString())
      .digest('hex')
      .substring(0, 16);

    const projectPath = `${hashed}/${body.projectName}`;
    return this.reportService.generateComplianceReport(projectPath, body.councilName);
  }
}
