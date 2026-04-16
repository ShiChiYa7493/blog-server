import { PartialType } from '@nestjs/mapped-types';
import { CreateGalleryCategoryDto } from './create-gallery-category.dto';

export class UpdateGalleryCategoryDto extends PartialType(CreateGalleryCategoryDto) {}
