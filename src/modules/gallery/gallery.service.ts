import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const [images, total] = await Promise.all([
      this.prisma.galleryImage.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.galleryImage.count(),
    ]);

    return {
      data: images,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async upload(file: Express.Multer.File) {
    return this.prisma.galleryImage.create({
      data: {
        filename: file.filename,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
  }

  async update(id: string, dto: UpdateGalleryDto) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    return this.prisma.galleryImage.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');

    // Try to delete the file from disk
    try {
      const filePath = join(process.cwd(), '../../uploads', image.filename);
      unlinkSync(filePath);
    } catch {
      // File may not exist, continue with DB deletion
    }

    return this.prisma.galleryImage.delete({ where: { id } });
  }
}
