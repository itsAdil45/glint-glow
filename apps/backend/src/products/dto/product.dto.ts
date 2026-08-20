import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class ProductImageDto {
  @IsString() url: string;
  @IsOptional() @IsString() alt?: string;
}

class ProductAttributeDto {
  @IsString() name: string;
  @IsArray() @IsString({ each: true }) values: string[];
}

class ProductVariationDto {
  @IsString() sku: string;
  @IsObject() attributes: Record<string, string>;
  @IsNumber() @Min(0) price: number;
  @IsOptional() @IsNumber() @Min(0) compareAtPrice?: number;
  @IsNumber() @Min(0) stock: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductImageDto)
  images?: ProductImageDto[];
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreateProductDto {
  @IsString() @MinLength(2) title: string;
  @IsOptional() @IsString() slug?: string;
  @IsString() description: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductImageDto)
  images?: ProductImageDto[];
  @IsNumber() @Min(0) basePrice: number;
  @IsOptional() @IsNumber() @Min(0) compareAtPrice?: number;
  @IsOptional() @IsBoolean() hasVariations?: boolean;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductVariationDto)
  variations?: ProductVariationDto[];
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) relatedProductIds?: string[];
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) seoKeywords?: string[];
}

export class UpdateProductDto extends CreateProductDto {}

export class QueryProductsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() category?: string; // category slug
  @IsOptional() @IsNumber() @Type(() => Number) minPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  @IsOptional() @IsNumber() @Type(() => Number) page?: number;
  @IsOptional() @IsNumber() @Type(() => Number) limit?: number;
  // attribute filters passed as attr[Color]=Red&attr[Size]=M handled separately via raw query
}
