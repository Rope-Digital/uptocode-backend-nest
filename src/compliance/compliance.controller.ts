import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ComplianceService } from './compliance.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('compliance-generate')
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

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
          destination: (req, file, cb) => {
            const { projectPath } = req.body;
            const uploadPath = join(process.cwd(), 'uploads', projectPath);
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const field = file.fieldname.toLowerCase();
            const original = file.originalname.replace(/\s+/g, '_');
            const ext = extname(file.originalname);
            cb(null, `${field}_${original}`);
          },
        }),
      }
    )
  )
  async generate(
    @Body()
    body: {
      address: string;
      councilName: string;
      belongsToCouncil: boolean;
      projectPath: string;
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
    @Req() req: any,
  ) {
    return this.complianceService.createComplianceRequest(body, files, req.user.id);
  }
}