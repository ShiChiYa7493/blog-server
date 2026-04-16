import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentStatus } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async findByArticleId(articleId: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    return this.prisma.comment.findMany({
      where: { articleId: article.id, status: CommentStatus.APPROVED, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        replies: {
          where: { status: CommentStatus.APPROVED },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async create(articleId: string, dto: CreateCommentDto) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Article not found');

    return this.prisma.comment.create({
      data: {
        ...dto,
        articleId: article.id,
        status: CommentStatus.APPROVED,
      },
    });
  }

  async findAllAdmin(page = 1, limit = 20) {
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { article: { select: { id: true, title: true, slug: true } } },
      }),
      this.prisma.comment.count(),
    ]);

    return {
      data: comments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, status: CommentStatus) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.comment.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.comment.delete({ where: { id } });
  }
}
