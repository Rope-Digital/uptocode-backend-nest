import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '@nestjs/passport'; // if using JWT

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(AuthGuard('jwt')) // assumes you're using JWT auth
  @Post('create')
  async createProject(
    @Body() body: { name: string },
    @Req() req: any,
  ) {
    const username = req.user.username;
    return this.projectService.createProject(req.user.id, username, body.name);
  }
}
