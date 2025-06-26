import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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
  ) {
    return this.complianceService.createComplianceRequest(body, files);
  }
}
