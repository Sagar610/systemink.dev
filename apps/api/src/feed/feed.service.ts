import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  private siteUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.siteUrl = this.configService.get('SITE_URL', 'http://localhost:5173');
  }

  async generateRss(): Promise<string> {
    const posts = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    const items = posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${this.siteUrl}/post/${post.slug}</link>
      <guid isPermaLink="true">${this.siteUrl}/post/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <author>${post.author.name}</author>
      <pubDate>${post.publishedAt?.toUTCString()}</pubDate>
    </item>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SystemInk</title>
    <link>${this.siteUrl}</link>
    <description>A multi-author blogging platform</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${this.siteUrl}/api/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
  }

  async generateSitemap(): Promise<string> {
    const [posts, tags, authors] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.tag.findMany({
        select: { slug: true },
      }),
      this.prisma.user.findMany({
        where: {
          posts: {
            some: { status: 'PUBLISHED' },
          },
        },
        select: { username: true },
      }),
    ]);

    const staticPages: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/tags', priority: '0.8', changefreq: 'weekly' },
      { url: '/authors', priority: '0.8', changefreq: 'weekly' },
      { url: '/search', priority: '0.7', changefreq: 'weekly' },
    ];

    const postUrls = posts.map((post) => ({
      url: `/post/${post.slug}`,
      lastmod: post.updatedAt.toISOString().split('T')[0],
      priority: '0.9',
      changefreq: 'weekly',
    }));

    const tagUrls: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = tags.map((tag) => ({
      url: `/tag/${tag.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    }));

    const authorUrls: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = authors.map((author) => ({
      url: `/author/${author.username}`,
      priority: '0.7',
      changefreq: 'weekly',
    }));

    const allUrls = [...staticPages, ...postUrls, ...tagUrls, ...authorUrls];

    const urlEntries = allUrls
      .map(
        (item) => `
  <url>
    <loc>${this.siteUrl}${item.url}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }

  getRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.siteUrl}/api/sitemap.xml
`;
  }
}
