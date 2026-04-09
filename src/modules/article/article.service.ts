import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticleService {
  // IP-based view dedup: key = "articleId:ip", value = expiry timestamp
  private viewCache = new Map<string, number>();
  private readonly VIEW_COOLDOWN = 10 * 60 * 1000; // 10 minutes

  constructor(private prisma: PrismaService) {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, expiry] of this.viewCache) {
        if (now > expiry) this.viewCache.delete(key);
      }
    }, 5 * 60 * 1000);
  }

  async findAll(query: QueryArticleDto) {
    const { page = 1, limit = 10, category, tag } = query;
    const where: any = { status: ArticleStatus.PUBLISHED };

    if (category) {
      where.category = { slug: category };
    }
    if (tag) {
      where.tags = { some: { slug: tag } };
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          tags: true,
        },
        omit: { content: true },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, ip?: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { category: true, tags: true },
    });
    if (!article) throw new NotFoundException('Article not found');

    // Increment view count (IP dedup: same IP only counts once per 10 min)
    const cacheKey = `${id}:${ip || 'unknown'}`;
    const now = Date.now();
    if (!this.viewCache.has(cacheKey) || now > (this.viewCache.get(cacheKey) || 0)) {
      this.viewCache.set(cacheKey, now + this.VIEW_COOLDOWN);
      await this.prisma.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return article;
  }

  // Admin: list all articles including drafts
  async findAllAdmin(query: QueryArticleDto) {
    const { page = 1, limit = 10 } = query;
    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, tags: true },
        omit: { content: true },
      }),
      this.prisma.article.count(),
    ]);

    return {
      data: articles,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateArticleDto) {
    const { tagIds, ...data } = dto;
    return this.prisma.article.create({
      data: {
        ...data,
        publishedAt: data.status === ArticleStatus.PUBLISHED ? new Date() : null,
        tags: tagIds ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async update(id: string, dto: UpdateArticleDto) {
    await this.ensureExists(id);
    const { tagIds, ...data } = dto;

    // If publishing for the first time, set publishedAt
    if (data.status === ArticleStatus.PUBLISHED) {
      const existing = await this.prisma.article.findUnique({ where: { id } });
      if (existing && !existing.publishedAt) {
        (data as any).publishedAt = new Date();
      }
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        ...data,
        tags: tagIds !== undefined
          ? { set: [], connect: tagIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.article.delete({ where: { id } });
  }

  async search(q: string, page = 1, limit = 10) {
    const where = {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { content: { contains: q, mode: 'insensitive' as const } },
        { summary: { contains: q, mode: 'insensitive' as const } },
      ],
    };

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: { category: true, tags: true },
        omit: { content: true },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async ensureExists(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
  }
}
