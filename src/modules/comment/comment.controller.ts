import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('articles/:id/comments')
  findByArticle(@Param('id') id: string) {
    return this.commentService.findByArticleId(id);
  }

  @Post('articles/:id/comments')
  create(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.commentService.create(id, dto);
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
