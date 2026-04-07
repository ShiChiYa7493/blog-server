import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [articleCount, publishedCount, draftCount, commentCount, totalViews] = await Promise.all([
      this.prisma.article.count(),
      this.prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      this.prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      this.prisma.comment.count(),
      this.prisma.article.aggregate({ _sum: { viewCount: true } }),
    ]);

    return {
      articleCount,
      publishedCount,
      draftCount,
      commentCount,
      totalViews: totalViews._sum.viewCount || 0,
    };
  }

  async generateRss(siteUrl: string) {
    const articles = await this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { category: true },
    });

    const items = articles
      .map(
        (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteUrl}/posts/${a.slug}</link>
      <description><![CDATA[${a.summary || ''}]]></description>
      <pubDate>${a.publishedAt?.toUTCString()}</pubDate>
      <guid>${siteUrl}/posts/${a.slug}</guid>
      <category>${a.category.name}</category>
    </item>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Shichiya Blog</title>
    <link>${siteUrl}</link>
    <description>Tech and Life Blog</description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`;
  }
}
