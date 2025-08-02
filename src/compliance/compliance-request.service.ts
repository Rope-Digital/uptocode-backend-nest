import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceRequest } from './compliance.entity';

@Injectable()
export class ComplianceRequestService {
  constructor(
    @InjectRepository(ComplianceRequest)
    private readonly complianceRepo: Repository<ComplianceRequest>,
  ) {}

  async getAllByUser(userId: number) {
    return this.complianceRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
