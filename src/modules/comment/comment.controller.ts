import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('articles/:slug/comments')
  findByArticle(@Param('slug') slug: string) {
    return this.commentService.findByArticleSlug(slug);
  }

  @Post('articles/:slug/comments')
  create(@Param('slug') slug: string, @Body() dto: CreateCommentDto) {
    return this.commentService.create(slug, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/comments')
  findAllAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.commentService.findAllAdmin(Number(page) || 1, Number(limit) || 20);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/comments/:id')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommentDto) {
    return this.commentService.updateStatus(id, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/comments/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.remove(id);
  }
}
