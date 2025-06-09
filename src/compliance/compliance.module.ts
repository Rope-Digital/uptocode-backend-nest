import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceRequest } from './compliance.entity';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceRequest])],
  providers: [ComplianceService],
  controllers: [ComplianceController],
})
export class ComplianceModule {}
