import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

const LAYOUTS = ['split', 'full-bleed'];
const IMAGE_POSITIONS = ['left', 'right'];
const THEMES = ['dark', 'light'];

export class CreateBannerDto {
  @IsOptional() @IsString() eyebrow?: string;
  @IsString() @MinLength(1) title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() ctaLabel?: string;
  @IsOptional() @IsString() ctaHref?: string;
  @IsString() @MinLength(1) image: string;
  @IsOptional() @IsString() imageAlt?: string;
  @IsOptional() @IsIn(LAYOUTS) layout?: 'split' | 'full-bleed';
  @IsOptional() @IsIn(IMAGE_POSITIONS) imagePosition?: 'left' | 'right';
  @IsOptional() @IsIn(THEMES) theme?: 'dark' | 'light';
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateBannerDto {
  @IsOptional() @IsString() eyebrow?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() ctaLabel?: string;
  @IsOptional() @IsString() ctaHref?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() imageAlt?: string;
  @IsOptional() @IsIn(LAYOUTS) layout?: 'split' | 'full-bleed';
  @IsOptional() @IsIn(IMAGE_POSITIONS) imagePosition?: 'left' | 'right';
  @IsOptional() @IsIn(THEMES) theme?: 'dark' | 'light';
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
