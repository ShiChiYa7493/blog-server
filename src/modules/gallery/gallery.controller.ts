import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GalleryService } from './gallery.service';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  // Public: list gallery images
  @Get('gallery')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.galleryService.findAll(Number(page) || 1, Number(limit) || 20, category);
  }

  // Admin: upload image to gallery
  @UseGuards(JwtAuthGuard)
  @Post('admin/gallery')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for gallery
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('categoryId') categoryId?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.galleryService.upload(file, categoryId);
  }

  // Admin: update image info
  @UseGuards(JwtAuthGuard)
  @Put('admin/gallery/:id')
  update(@Param('id') id: string, @Body() dto: UpdateGalleryDto) {
    return this.galleryService.update(id, dto);
  }

  // Admin: delete image
  @UseGuards(JwtAuthGuard)
  @Delete('admin/gallery/:id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
