import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { ProjectController } from './project.controller';
import { ProjectAccessController } from './project.access.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User])],
  controllers: [ProjectController, ProjectAccessController],
  providers: [ProjectService],
})
export class ProjectModule {}
