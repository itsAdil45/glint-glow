import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  findAll() {
    return this.categoryModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  findAllAdmin() {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  findBySlug(slug: string) {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? slugify(dto.slug, { lower: true }) : slugify(dto.name, { lower: true });
    const category = new this.categoryModel({
      name: dto.name,
      slug,
      parentId: dto.parentId || null,
      image: dto.image,
      seo: { title: dto.seoTitle, description: dto.seoDescription },
    });
    return category.save();
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const update: any = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug, { lower: true });
    if (dto.seoTitle || dto.seoDescription) {
      update.seo = { title: dto.seoTitle, description: dto.seoDescription };
      delete update.seoTitle;
      delete update.seoDescription;
    }
    const category = await this.categoryModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string) {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Category not found');
    return { message: 'Category removed' };
  }
}
