import { applyDecorators } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
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
  // Homepage row placement toggles — independent of category (see schema
  // comment). Kept as separate booleans rather than a generic tags array
  // since the set of rows is small and fixed today; admin table exposes
  // each as its own toggle chip, same pattern as isFeatured.
  @IsOptional() @IsBoolean() isFragrance?: boolean;
  @IsOptional() @IsBoolean() isSkinCare?: boolean;
  @IsOptional() @IsBoolean() isMakeupAccessory?: boolean;
  @IsOptional() @IsBoolean() isMakeup?: boolean;
  @IsOptional() @IsBoolean() isLingerie?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) relatedProductIds?: string[];
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) seoKeywords?: string[];
}

// PartialType makes every inherited field optional (title/description/basePrice
// included) while keeping their validators for whatever IS provided — a naive
// `extends CreateProductDto` would inherit those as still-required, so a
// partial PATCH (e.g. just { isFeatured: true } for an inline table toggle)
// would fail validation for fields the request never intended to touch.
export class UpdateProductDto extends PartialType(CreateProductDto) {}

// Query strings are always strings, and `@Type(() => Boolean)` would turn
// "false" into `true` (any non-empty string is truthy) — so boolean filters
// need an explicit Transform rather than the usual @Type coercion.
function BooleanQueryParam() {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => value === 'true' || value === true),
    IsBoolean(),
  );
}

export class QueryProductsDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() category?: string; // category slug
  @IsOptional() @IsNumber() @Type(() => Number) minPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsString() brand?: string;
  @BooleanQueryParam() featured?: boolean;
  @BooleanQueryParam() fragrance?: boolean;
  @BooleanQueryParam() skinCare?: boolean;
  @BooleanQueryParam() makeupAccessory?: boolean;
  @BooleanQueryParam() makeup?: boolean;
  @BooleanQueryParam() lingerie?: boolean;
  @IsOptional() @IsString() sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  @IsOptional() @IsNumber() @Type(() => Number) page?: number;
  @IsOptional() @IsNumber() @Type(() => Number) limit?: number;
  // attribute filters passed as attr[Color]=Red&attr[Size]=M handled separately via raw query
}
