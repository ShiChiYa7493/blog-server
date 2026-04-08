import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get('articles')
  findAll(@Query() query: QueryArticleDto) {
    return this.articleService.findAll(query);
  }

  @Get('articles/:id')
  findById(@Param('id') id: string) {
    return this.articleService.findById(id);
  }

  @Get('search')
  search(@Query('q') q: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.articleService.search(q, Number(page) || 1, Number(limit) || 10);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/articles')
  findAllAdmin(@Query() query: QueryArticleDto) {
    return this.articleService.findAllAdmin(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/articles')
  create(@Body() dto: CreateArticleDto) {
    return this.articleService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/articles/:id')
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articleService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/articles/:id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }
}
