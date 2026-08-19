import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

export interface CategoryNavNode {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  children: CategoryNavNode[];
}

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

  /**
   * Builds the active category tree for the storefront's mega menu, using
   * the existing parentId self-reference — no separate "nav" data model.
   * Depth is capped at 3 (root -> subcategory -> leaf) to match what the
   * mega menu can actually render; anything deeper is silently dropped
   * rather than causing the storefront to recurse indefinitely.
   */
  async findNavTree(): Promise<CategoryNavNode[]> {
    const categories = await this.categoryModel.find({ isActive: true }).sort({ name: 1 }).exec();

    const byParent = new Map<string, CategoryDocument[]>();
    for (const cat of categories) {
      const key = cat.parentId ? cat.parentId.toString() : 'root';
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(cat);
    }

    const build = (parentKey: string, depth: number): CategoryNavNode[] => {
      if (depth > 3) return [];
      const children = byParent.get(parentKey) || [];
      return children.map((cat) => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        children: build(cat._id.toString(), depth + 1),
      }));
    };

    return build('root', 1);
  }

  private async assertNoCycle(id: string, parentId: string) {
    if (id === parentId) throw new BadRequestException('A category cannot be its own parent');
    let current = await this.categoryModel.findById(parentId).exec();
    const visited = new Set<string>();
    while (current?.parentId) {
      const currentIdStr = current._id.toString();
      if (currentIdStr === id || visited.has(currentIdStr)) {
        throw new BadRequestException('That would create a circular category hierarchy');
      }
      visited.add(currentIdStr);
      current = await this.categoryModel.findById(current.parentId).exec();
    }
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? slugify(dto.slug, { lower: true }) : slugify(dto.name, { lower: true });
    const category = new this.categoryModel({
      name: dto.name,
      slug,
      parentId: dto.parentId || null,
      image: dto.image,
      isActive: dto.isActive ?? true,
      seo: { title: dto.seoTitle, description: dto.seoDescription },
    });
    return category.save();
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (dto.parentId) await this.assertNoCycle(id, dto.parentId);

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
    const childCount = await this.categoryModel.countDocuments({ parentId: id }).exec();
    if (childCount > 0) {
      throw new BadRequestException(
        'This category has subcategories — remove or reassign them first',
      );
    }
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Category not found');
    return { message: 'Category removed' };
  }
}
