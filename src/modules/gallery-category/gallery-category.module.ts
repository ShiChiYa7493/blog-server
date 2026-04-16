import { Module } from '@nestjs/common';
import { GalleryCategoryController } from './gallery-category.controller';
import { GalleryCategoryService } from './gallery-category.service';

@Module({
  controllers: [GalleryCategoryController],
  providers: [GalleryCategoryService],
})
export class GalleryCategoryModule {}
