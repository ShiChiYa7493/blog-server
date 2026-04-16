import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { TagModule } from './modules/tag/tag.module';
import { ArticleModule } from './modules/article/article.module';
import { CommentModule } from './modules/comment/comment.module';
import { UploadModule } from './modules/upload/upload.module';
import { StatsModule } from './modules/stats/stats.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { GalleryCategoryModule } from './modules/gallery-category/gallery-category.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CategoryModule,
    TagModule,
    ArticleModule,
    CommentModule,
    UploadModule,
    StatsModule,
    GalleryModule,
    GalleryCategoryModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
