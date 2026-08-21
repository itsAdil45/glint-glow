import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { Product, ProductDocument } from './schemas/product.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { CreateProductDto, QueryProductsDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private toSeoFields(dto: Partial<CreateProductDto>) {
    return {
      title: dto.seoTitle,
      description: dto.seoDescription,
      keywords: dto.seoKeywords || [],
    };
  }

  /** Distinct brand names across published products — backs the storefront's Brands nav flyout. */
  async findDistinctBrands(): Promise<string[]> {
    const brands = await this.productModel.distinct('brand', {
      isPublished: true,
      brand: { $nin: [null, ''] },
    });
    return (brands as string[]).sort((a, b) => a.localeCompare(b));
  }

  async findAll(query: QueryProductsDto, rawAttrFilters: Record<string, string> = {}) {
    const filter: any = { isPublished: true };

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.category) {
      const category = await this.categoryModel.findOne({ slug: query.category }).exec();
      if (category) filter.categoryIds = category._id;
      else filter.categoryIds = { $in: [] }; // no matches
    }
    if (query.brand) {
      filter.brand = query.brand;
    }
    if (query.minPrice != null || query.maxPrice != null) {
      filter.basePrice = {};
      if (query.minPrice != null) filter.basePrice.$gte = query.minPrice;
      if (query.maxPrice != null) filter.basePrice.$lte = query.maxPrice;
    }
    for (const [key, value] of Object.entries(rawAttrFilters)) {
      filter[`variations.attributes.${key}`] = value;
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const skip = (page - 1) * limit;

    let sort: any = { createdAt: -1 };
    if (query.sort === 'price_asc') sort = { basePrice: 1 };
    if (query.sort === 'price_desc') sort = { basePrice: -1 };
    if (query.sort === 'popular') sort = { ratingsCount: -1 };

    const [items, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, isPublished: true })
      .populate('relatedProductIds')
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  findByIdAdmin(id: string) {
    return this.productModel.findById(id).exec();
  }

  findAllAdmin() {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  private validateVariations(dto: Partial<CreateProductDto>) {
    if (dto.hasVariations) {
      if (!dto.variations || dto.variations.length === 0) {
        throw new BadRequestException('At least one variation is required when hasVariations is true');
      }
      const skus = new Set<string>();
      for (const v of dto.variations) {
        if (skus.has(v.sku)) throw new BadRequestException(`Duplicate SKU: ${v.sku}`);
        skus.add(v.sku);
      }
    }
  }

  async create(dto: CreateProductDto) {
    this.validateVariations(dto);
    const slug = dto.slug ? slugify(dto.slug, { lower: true }) : slugify(dto.title, { lower: true });

    const product = new this.productModel({
      title: dto.title,
      slug,
      description: dto.description,
      shortDescription: dto.shortDescription,
      brand: dto.brand,
      categoryIds: (dto.categoryIds || []).map((id) => new Types.ObjectId(id)),
      images: dto.images || [],
      basePrice: dto.basePrice,
      compareAtPrice: dto.compareAtPrice,
      hasVariations: !!dto.hasVariations,
      attributes: dto.attributes || [],
      variations: dto.variations || [],
      stock: dto.stock || 0,
      isPublished: dto.isPublished ?? true,
      isFeatured: dto.isFeatured ?? false,
      relatedProductIds: (dto.relatedProductIds || []).map((id) => new Types.ObjectId(id)),
      seo: this.toSeoFields(dto),
    });
    return product.save();
  }

  async update(id: string, dto: UpdateProductDto) {
    this.validateVariations(dto);
    const update: any = {
      title: dto.title,
      description: dto.description,
      shortDescription: dto.shortDescription,
      brand: dto.brand,
      basePrice: dto.basePrice,
      compareAtPrice: dto.compareAtPrice,
      hasVariations: dto.hasVariations,
      attributes: dto.attributes,
      variations: dto.variations,
      stock: dto.stock,
      isPublished: dto.isPublished,
      isFeatured: dto.isFeatured,
    };
    // Dot-path assignment updates each SEO sub-field independently rather
    // than replacing the whole `seo` subdocument — a partial PATCH that
    // doesn't mention SEO at all (e.g. an inline table toggle sending just
    // { isFeatured: true }) must never wipe out seo.title/description that
    // were never part of this request.
    if (dto.seoTitle !== undefined) update['seo.title'] = dto.seoTitle;
    if (dto.seoDescription !== undefined) update['seo.description'] = dto.seoDescription;
    if (dto.seoKeywords !== undefined) update['seo.keywords'] = dto.seoKeywords;
    if (dto.slug) update.slug = slugify(dto.slug, { lower: true });
    if (dto.categoryIds) update.categoryIds = dto.categoryIds.map((id) => new Types.ObjectId(id));
    if (dto.relatedProductIds)
      update.relatedProductIds = dto.relatedProductIds.map((id) => new Types.ObjectId(id));
    if (dto.images) update.images = dto.images;

    const product = await this.productModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Product not found');
    return { message: 'Product removed' };
  }

  /** Resolves unit price + stock for a product/variation pair; used by cart & orders. */
  async resolveVariant(productId: string, variationSku?: string | null) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new NotFoundException('Product not found');

    if (product.hasVariations) {
      const variation = product.variations.find((v) => v.sku === variationSku);
      if (!variation) throw new BadRequestException('Selected variation not found');
      return { product, price: variation.price, stock: variation.stock, variation };
    }
    return { product, price: product.basePrice, stock: product.stock, variation: null };
  }

  /** Decrements stock after an order is placed. */
  async decrementStock(productId: string, variationSku: string | null, quantity: number) {
    if (variationSku) {
      await this.productModel.updateOne(
        { _id: productId, 'variations.sku': variationSku },
        { $inc: { 'variations.$.stock': -quantity } },
      );
    } else {
      await this.productModel.updateOne({ _id: productId }, { $inc: { stock: -quantity } });
    }
  }
}
