import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { rmSync } from 'fs';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  private hashUserId(userId: number): string {
    return crypto
      .createHash('sha256')
      .update(userId.toString())
      .digest('hex')
      .substring(0, 16);

  }

  // Create Project
  async createProject(userId: number, projectName: string) {
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

  // Get Projects by User
  async getProjectsByUser(userId: number) {
    const projects = await this.projectRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      uploadPath: project.uploadPath,
      userId: project.user.id,
      createdAt: project.createdAt,
    }));
  }

  // Get Project by ID
  async getProjectById(projectId: number) {
    return this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['user'],
    });
  }

  async deleteProject(projectId: number, userId: number) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['user'],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.user.id !== userId) {
      throw new Error('Unauthorized access to delete project');
    }

    const fullPath = join(process.cwd(), project.uploadPath);
    try {
      rmSync(fullPath, { recursive: true, force: true });
    } catch (err) {
      console.error('Failed to delete folder:', err.message);
    }

    await this.projectRepo.remove(project);
    return { message: 'Project and folder deleted', projectId };
  }

}
