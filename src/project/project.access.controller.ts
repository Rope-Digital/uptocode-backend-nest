import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectService } from './project.service';
import { readdirSync } from 'fs';
import { join } from 'path';

@Controller('project-access')
@UseGuards(AuthGuard('jwt'))
export class ProjectAccessController {
  constructor(private readonly projectService: ProjectService) { }

  // Returns sanitized user projects
  @Get('my-projects')
  async getUserProjects(@Req() req: any) {
    const userId = req.user.id || req.user.userId; // support both depending on token payload
    return this.projectService.getProjectsByUser(userId);
  }

  // Returns specific project if authorized
  @Get('project-files/:projectId')
  async getProjectFiles(@Req() req: any, @Param('projectId') projectId: number) {
    const project = await this.projectService.getProjectById(projectId);

    if (!project) {
      return { message: 'Project not found' };
    }

    const requestUserId = req.user.id || req.user.userId;
    if (project.user.id !== requestUserId) {
      return { message: 'Unauthorized access to project' };
    }

    const fullPath = join(process.cwd(), project.uploadPath);
    const files = readdirSync(fullPath);

    return {
      projectId: project.id,
      projectName: project.name,
      files,
    };
  }

  // Deletes a project if authorized
  // @Delete('delete/:projectId')
  // async deleteProject(@Req() req: any, @Param('projectId') projectId: number) {
  //   const userId = req.user.id;
  //   return this.projectService.deleteProject(projectId, userId);
  // }

  @Delete('delete/:projectId')
  async deleteProject(@Req() req: any, @Param('projectId') projectId: number) {
    const userId = req.user.id || req.user.userId; // Add fallback
    return this.projectService.deleteProject(projectId, userId);
  }

}