import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private hashUserId(userId: number): string {
    return crypto
      .createHash('sha256')
      .update(userId.toString())
      .digest('hex')
      .substring(0, 16);

    }
    
    async createProject(userId: number, projectName: string) {
    console.log('userId:', userId);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const userDir = this.hashUserId(userId);
    const basePath = `uploads/${userDir}/${projectName}`;
    const fullPath = join(process.cwd(), basePath);

    if (!existsSync(fullPath)) mkdirSync(fullPath, { recursive: true });

    const project = this.projectRepo.create({
      name: projectName,
      user,
      uploadPath: basePath,
    });

    return this.projectRepo.save(project);
  }
}
