import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [articleCount, publishedCount, draftCount, commentCount, totalViews] =
      await Promise.all([
        this.prisma.article.count(),
        this.prisma.article.count({
          where: { status: ArticleStatus.PUBLISHED },
        }),
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
      <link>${siteUrl}/blog/posts/${a.id}</link>
      <description><![CDATA[${a.summary || ''}]]></description>
      <pubDate>${a.publishedAt?.toUTCString()}</pubDate>
      <guid>${siteUrl}/blog/posts/${a.id}</guid>
      <category>${a.category.name}</category>
    </item>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>优川七夜的博客</title>
    <link>${siteUrl}/blog</link>
    <description>跨越现今 前往未来 Weigh Anchor!</description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`;
  }
}
