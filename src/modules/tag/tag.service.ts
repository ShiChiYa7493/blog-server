import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.tag.findUnique({ where: { slug } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  create(dto: CreateTagDto) {
    return this.prisma.tag.create({ data: dto });
  }

  async update(id: number, dto: UpdateTagDto) {
    await this.ensureExists(id);
    return this.prisma.tag.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.tag.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
  }
}
