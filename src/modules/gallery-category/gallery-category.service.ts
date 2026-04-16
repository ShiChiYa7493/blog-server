import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';

@Injectable()
export class GalleryCategoryService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.galleryCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { images: true } } },
    });
  }

  create(dto: CreateGalleryCategoryDto) {
    return this.prisma.galleryCategory.create({ data: dto });
  }

  async update(id: string, dto: UpdateGalleryCategoryDto) {
    await this.ensureExists(id);
    return this.prisma.galleryCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.galleryCategory.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const cat = await this.prisma.galleryCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Gallery category not found');
  }
}
