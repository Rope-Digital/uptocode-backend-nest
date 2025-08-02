import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as crypto from 'crypto';

import { ComplianceService } from './compliance.service';
import { ComplianceRequestService } from './compliance-request.service';
import { ProjectService } from '../project/project.service';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../types/request-with-user';

@UseGuards(AuthGuard('jwt'))
@Controller('compliance-generate')
export class ComplianceController {
  constructor(
    private complianceService: ComplianceService,
    private complianceRequestService: ComplianceRequestService,
    private projectService: ProjectService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'sitePlan', maxCount: 1 },
        { name: 'floorPlan', maxCount: 1 },
        { name: 'sectionPlan', maxCount: 1 },
        { name: 'elevationPlan', maxCount: 1 },
        { name: 'detailedPlan', maxCount: 1 },
        { name: 'supportingDocs', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req: RequestWithUser, file, cb) => {
            const userId = req.user.id || req.user.userId;
            const address = req.body.address;

            if (!userId || !address) return cb(new Error('Missing user or address'), '');

            const hashed = crypto
              .createHash('sha256')
              .update(userId.toString())
              .digest('hex')
              .substring(0, 16);

            const uploadPath = join(process.cwd(), 'uploads', hashed, address);

            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath, { recursive: true });
            }

            req.body.projectPath = `${hashed}/${address}`;
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const field = file.fieldname.toLowerCase();
            const original = file.originalname.replace(/\s+/g, '_');
            const ext = extname(file.originalname);
            cb(null, `${field}_${original}`);
          },
        }),
      },
    ),
  )
  async generate(
    @Body()
    body: {
      address: string;
      councilName: string;
      belongsToCouncil: boolean;
      projectPath?: string;
    },
    @UploadedFiles()
    files: {
      sitePlan?: Express.Multer.File[];
      floorPlan?: Express.Multer.File[];
      sectionPlan?: Express.Multer.File[];
      elevationPlan?: Express.Multer.File[];
      detailedPlan?: Express.Multer.File[];
      supportingDocs?: Express.Multer.File[];
    },
    @Req() req: RequestWithUser,
  ) {
    const userId = (req.user.id || req.user.userId)!;

    const createdProject = await this.projectService.createProject(userId, body.address);

    const updatedBody = {
      ...body,
      projectPath: createdProject.uploadPath.replace(/^uploads[\\/]/, ''),
    };

    return this.complianceService.createComplianceRequest(updatedBody, files, userId);
  }

  @Get('my-requests')
  async getMyComplianceRequests(@Req() req: RequestWithUser) {
    const userId = (req.user.id || req.user.userId)!;
    return this.complianceRequestService.getAllByUser(userId);
  }
}
