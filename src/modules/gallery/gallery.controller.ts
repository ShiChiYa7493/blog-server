import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { GalleryService } from './gallery.service';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  // Public: list gallery images
  @Get('gallery')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.galleryService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  // Admin: upload image to gallery
  @UseGuards(JwtAuthGuard)
  @Post('admin/gallery')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), '../../uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for gallery
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.galleryService.upload(file);
  }

  // Admin: update image info
  @UseGuards(JwtAuthGuard)
  @Put('admin/gallery/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGalleryDto) {
    return this.galleryService.update(id, dto);
  }

  // Admin: delete image
  @UseGuards(JwtAuthGuard)
  @Delete('admin/gallery/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.remove(id);
  }
}
