import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus(): any {
    return {
      status: 'OK',
      message: 'Uptocode Backend API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
