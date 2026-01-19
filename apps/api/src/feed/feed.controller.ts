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

  @Get()
  @Public()
  root() {
    return {
      message: 'SystemInk API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        posts: '/api/posts',
        tags: '/api/tags',
        users: '/api/users',
        comments: '/api/posts/:postId/comments',
        uploads: '/api/uploads',
        feed: {
          rss: '/api/rss.xml',
          sitemap: '/api/sitemap.xml',
          robots: '/api/robots.txt',
        },
      },
      documentation: 'Visit /api/health to check API status',
    };
  }
}
