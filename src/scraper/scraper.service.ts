// src/scraper/scraper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer-extra';
import generateCouncilUrls from './utils/generateCouncilUrls';
import proxies from './utils/proxies';
const pLimit = require('p-limit');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cloudscraper = require('cloudscraper');

@Injectable()
export class ScraperService {
  // --- Configuration for a more robust scraper ---
  private readonly CONCURRENCY = 3;
  private readonly MAX_PAGES_PER_COUNCIL = 5;
  private readonly DOWNLOAD_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 3000; // 3 seconds

  private readonly DOCUMENT_TABLE_SELECTOR = '.rpl-search-results-layout.result-table';

  private readonly logger = new Logger(ScraperService.name);
  private readonly DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');

  constructor() {
    if (!fs.existsSync(this.DOWNLOAD_DIR)) {
      fs.mkdirSync(this.DOWNLOAD_DIR);
      this.logger.log(`Created download directory at: ${this.DOWNLOAD_DIR}`);
    }
    puppeteer.use(StealthPlugin());
  }

  private councils: string[] = [
    "Alpine", "Alpine Resorts", "Ararat", "Ballarat", "Banyule", "Bass Coast", "Baw Baw", "Bayside", "Benalla", "Boroondara", "Brimbank", "Buloke",
    "Campaspe", "Cardinia", "Casey", "Central Goldfields", "Colac Otway", "Corangamite", "Darebin", "East Gippsland", "Frankston", "French Island and Sandstone Island",
    "Gannawarra", "Glen Eira", "Glenelg", "Golden Plains", "Greater Bendigo", "Greater Dandenong", "Greater Geelong", "Greater Shepparton",
    "Hepburn", "Hindmarsh", "Hobsons Bay", "Horsham", "Hume", "Indigo", "Kingston", "Knox", "Latrobe", "Loddon",
    "Macedon Ranges", "Manningham", "Mansfield", "Maribyrnong", "Maroondah", "Melbourne", "Melton", "Merri-bek", "Mildura", "Mitchell", "Moira", "Monash", "Moonee Valley", "Moorabool", "Mornington Peninsula", "Mount Alexander", "Moyne", "Murrindindi",
    "Nillumbik", "Northern Grampians", "Port of Melbourne", "Port Phillip", "Pyrenees", "Queenscliffe", "South Gippsland", "Southern Grampians", "Stonnington", "Strathbogie", "Surf Coast", "Swan Hill", "Towong", "Victoria Planning Provisions",
    "Wangaratta", "Warrnambool", "Wellington", "West Wimmera", "Whitehorse", "Whittlesea", "Wodonga", "Wyndham", "Yarra", "Yarra Ranges", "Yarriambiack"
  ];

  private getRandomProxy() {
    if (proxies.length === 0) return null;
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    const [host, port, username, password] = proxy.split(':');
    return {
      proxy: `http://${username}:${password}@${host}:${port}`,
      name: `${host}:${port}`,
    };
  }

  // This function is now more patient and specific.
  private async getDocumentLinksWithPuppeteer(url: string): Promise<string[]> {
    this.logger.log(`Launching Stealth Puppeteer for: ${url}`);
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      this.logger.log(`[Puppeteer] Waiting for selector: ${this.DOCUMENT_TABLE_SELECTOR}`);
      await page.waitForSelector(this.DOCUMENT_TABLE_SELECTOR, { timeout: 30000 });
      this.logger.log(`[Puppeteer] Selector found. Extracting links.`);

      const links = await page.evaluate((pageUrl, tableSelector) => {
        const table = document.querySelector(tableSelector);
        if (!table) return [];
        // FIX: Only look for links inside the table.
        return (Array.from(table.querySelectorAll('a')) as HTMLAnchorElement[])
          .map(a => a.href)
          .filter(link => link && (link.endsWith('.pdf') || link.endsWith('.doc') || link.endsWith('.docx')))
          .map(link => new URL(link, pageUrl).href);
      }, url, this.DOCUMENT_TABLE_SELECTOR) as string[];

      await browser.close();
      this.logger.log(`[Puppeteer] Found ${links.length} links on ${url}`);
      return [...new Set(links)];
    } catch (error) {
      if (browser) await browser.close();
      this.logger.error(`[Puppeteer] Error on ${url}: ${error.message}`);
      return [];
    }
  }

  // This function is now more specific.
  private async getDocumentLinks(url: string): Promise<string[]> {
    this.logger.log(`Attempting to fetch with cloudscraper from ${url}`);
    try {
      this.logger.log(`Website is a JavaScript application. Using Puppeteer directly.`);
      return this.getDocumentLinksWithPuppeteer(url);
    } catch (error) {
      this.logger.error(`An unexpected error occurred in getDocumentLinks: ${error.message}`);
      return [];
    }
  }

  // retries.
  private async downloadFile(fileUrl: string, baseUrl: string) {
    const councilNameFromUrl = new URL(baseUrl).pathname.split('/')[1] || 'unknown';
    const councilFolderName = `${councilNameFromUrl}_council`;
    const councilFolderPath = path.join(this.DOWNLOAD_DIR, councilFolderName);
    if (!fs.existsSync(councilFolderPath)) {
      fs.mkdirSync(councilFolderPath, { recursive: true });
    }

    const fileName = path.basename(new URL(fileUrl).pathname);
    const targetFilePath = path.join(councilFolderPath, fileName);

    if (fs.existsSync(targetFilePath)) {
      this.logger.log(`Skipping (already exists): ${fileName}`);
      return;
    }

    for (let attempt = 1; attempt <= this.DOWNLOAD_RETRIES; attempt++) {
      try {
        const proxyInfo = this.getRandomProxy();
        this.logger.log(`Downloading: ${fileName} (Attempt ${attempt}/${this.DOWNLOAD_RETRIES})`);
        const response = await cloudscraper({
          method: 'GET',
          url: fileUrl,
          encoding: null,
          timeout: 60000,
          proxy: proxyInfo?.proxy,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        fs.writeFileSync(targetFilePath, response);
        this.logger.log(`Downloaded successfully: ${fileName} -> ${councilFolderName}`);
        return; // Success, exit the loop
      } catch (error) {
        this.logger.error(`Error downloading ${fileName} (Attempt ${attempt}): ${error.message}`);
        if (attempt < this.DOWNLOAD_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS));
        } else {
          this.logger.error(`Failed to download ${fileName} after ${this.DOWNLOAD_RETRIES} attempts.`);
        }
      }
    }
  }

  async scrapeDocuments() {
    this.logger.log('--- Starting Scraper Job ---');
    const limit = pLimit(this.CONCURRENCY);
    const SCRAPER_BASE_URL = 'https://planning-schemes.app.planning.vic.gov.au';
    const urls = generateCouncilUrls(this.councils, this.MAX_PAGES_PER_COUNCIL, SCRAPER_BASE_URL);

    for (const url of urls) {
      const docLinks = await this.getDocumentLinks(url);
      if (docLinks.length === 0) {
        this.logger.log(`No document links found on ${url}, moving to next.`);
        continue;
      }

      this.logger.log(`Found ${docLinks.length} documents on ${url}. Queueing for download.`);
      const downloadPromises = docLinks.map(docLink =>
        limit(() => this.downloadFile(docLink, url))
      );
      await Promise.all(downloadPromises);
    }

    this.logger.log('--- Scraper Job Complete ---');
    return { message: 'Scraping process finished.' };
  }
}