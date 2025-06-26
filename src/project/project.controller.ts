import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createProject(
    @Body() body: { name: string },
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    // console.log('userId:', userId);
    return this.projectService.createProject(userId, body.name);
  }


}
