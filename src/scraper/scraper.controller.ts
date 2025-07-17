import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('start')
  @HttpCode(HttpStatus.ACCEPTED)
  startScraping() {
    this.scraperService.scrapeDocuments();
    
    return { message: 'Scraping process has been started.' };
  }
}