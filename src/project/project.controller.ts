import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ProjectService } from './project.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createProject(
    @Body() body: { name: string },
    @Req() req: any,
  ) {
    const username = req.user.username;
    return this.projectService.createProject(req.user.id, username, body.name);
  }
}
