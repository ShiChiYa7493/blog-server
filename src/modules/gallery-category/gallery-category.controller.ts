import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GalleryCategoryService } from './gallery-category.service';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class GalleryCategoryController {
  constructor(private service: GalleryCategoryService) {}

  @Get('gallery-categories')
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/gallery-categories')
  create(@Body() dto: CreateGalleryCategoryDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/gallery-categories/:id')
  update(@Param('id') id: string, @Body() dto: UpdateGalleryCategoryDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/gallery-categories/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
