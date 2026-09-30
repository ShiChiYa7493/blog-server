import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CosStorageService } from '../../common/cos-storage.service';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private storage: CosStorageService,
  ) {}

  async findAll(page = 1, limit = 20, category?: string) {
    const where: { category?: { slug: string } } = {};
    if (category) where.category = { slug: category };

    const [images, total] = await Promise.all([
      this.prisma.galleryImage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.galleryImage.count({ where }),
    ]);

    return {
      data: images,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async upload(file: Express.Multer.File, categoryId?: string) {
    const stored = await this.storage.save(file.originalname, file.buffer, file.mimetype);
    return this.prisma.galleryImage.create({
      data: {
        filename: stored.filename,
        url: stored.url,
        size: file.size,
        mimeType: file.mimetype,
        categoryId: categoryId || null,
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateGalleryDto) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    return this.prisma.galleryImage.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');

    // COS object for absolute URLs, local file otherwise; failures are tolerated
    await this.storage.remove(image.filename, image.url);

    return this.prisma.galleryImage.delete({ where: { id } });
  }
}
