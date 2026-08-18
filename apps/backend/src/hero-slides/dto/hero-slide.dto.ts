import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateHeroSlideDto {
  @IsOptional() @IsString() eyebrow?: string;
  @IsString() @MinLength(1) title: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() ctaLabel?: string;
  @IsOptional() @IsString() ctaHref?: string;
  @IsString() @MinLength(1) image: string;
  @IsOptional() @IsString() imageAlt?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateHeroSlideDto {
  @IsOptional() @IsString() eyebrow?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() ctaLabel?: string;
  @IsOptional() @IsString() ctaHref?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() imageAlt?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
