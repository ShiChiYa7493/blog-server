import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class TagController {
  constructor(private tagService: TagService) {}

  @Get('tags')
  findAll() {
    return this.tagService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/tags')
  create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/tags/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/tags/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.remove(id);
  }
}
