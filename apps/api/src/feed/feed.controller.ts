import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { FeedService } from './feed.service';
import { Public } from '../auth/public.decorator';

@Controller()
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('rss.xml')
  @Public()
  async rss(@Res() res: Response) {
    const xml = await this.feedService.generateRss();
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get('sitemap.xml')
  @Public()
  async sitemap(@Res() res: Response) {
    const xml = await this.feedService.generateSitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get('robots.txt')
  @Public()
  robots(@Res() res: Response) {
    const txt = this.feedService.getRobotsTxt();
    res.setHeader('Content-Type', 'text/plain');
    res.send(txt);
  }

  @Get('health')
  @Public()
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
