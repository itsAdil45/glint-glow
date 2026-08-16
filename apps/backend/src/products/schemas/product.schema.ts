import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ _id: false })
class ProductImage {
  @Prop({ required: true })
  url: string;

  @Prop({ default: '' })
  alt: string;
}

@Schema({ _id: false })
class ProductAttribute {
  @Prop({ required: true })
  name: string; // e.g. "Color"

  @Prop({ type: [String], required: true })
  values: string[]; // e.g. ["Red", "Blue"]
}

@Schema({ _id: false })
export class ProductVariation {
  @Prop({ required: true, unique: false })
  sku: string;

  // e.g. { Color: 'Red', Size: 'M' }
  @Prop({ type: Map, of: String, required: true })
  attributes: Map<string, string>;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  compareAtPrice?: number;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ type: [ProductImage], default: [] })
  images: ProductImage[];

  @Prop()
  weight?: number;

  @Prop({ default: true })
  isActive: boolean;
}
const ProductVariationSchema = SchemaFactory.createForClass(ProductVariation);

@Schema({ _id: false })
class ProductSeo {
  @Prop() title?: string;
  @Prop() description?: string;
  @Prop({ type: [String], default: [] }) keywords?: string[];
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, index: 'text' })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ trim: true })
  shortDescription?: string;

  @Prop({ trim: true })
  brand?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [], index: true })
  categoryIds: Types.ObjectId[];

  @Prop({ type: [ProductImage], default: [] })
  images: ProductImage[];

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({ min: 0 })
  compareAtPrice?: number;

  @Prop({ default: false })
  hasVariations: boolean;

  @Prop({ type: [ProductAttribute], default: [] })
  attributes: ProductAttribute[];

  @Prop({ type: [ProductVariationSchema], default: [] })
  variations: ProductVariation[];

  // Used only when hasVariations is false
  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ default: true, index: true })
  isPublished: boolean;

  @Prop({ default: false, index: true })
  isFeatured: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  relatedProductIds: Types.ObjectId[];

  @Prop({ default: 0 })
  ratingsAvg: number;

  @Prop({ default: 0 })
  ratingsCount: number;

  @Prop({ type: ProductSeo, default: {} })
  seo: ProductSeo;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ title: 'text', description: 'text', brand: 'text' });
