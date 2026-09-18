import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CouponType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @IsString() @MinLength(3) code: string;
  @IsEnum(CouponType) type: CouponType;

  // Capped at 100 only for a percentage coupon — a fixed-amount coupon's
  // value is a currency amount, not a percentage, so no such ceiling
  // applies to it.
  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.type === CouponType.PERCENTAGE)
  @Max(100)
  value: number;

  @IsOptional() @IsNumber() @Min(0) maxDiscountAmount?: number;
  @IsOptional() @IsNumber() @Min(0) minOrderValue?: number;
  @IsOptional() @IsInt() @Min(1) usageLimit?: number;
  @IsOptional() @IsInt() @Min(1) usageLimitPerUser?: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class UpdateCouponDto {
  @IsOptional() @IsString() @MinLength(3) code?: string;
  @IsOptional() @IsEnum(CouponType) type?: CouponType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateIf((o) => o.type === CouponType.PERCENTAGE)
  @Max(100)
  value?: number;

  @IsOptional() @IsNumber() @Min(0) maxDiscountAmount?: number;
  @IsOptional() @IsNumber() @Min(0) minOrderValue?: number;
  @IsOptional() @IsInt() @Min(1) usageLimit?: number;
  @IsOptional() @IsInt() @Min(1) usageLimitPerUser?: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class ApplyCouponDto {
  @IsString() @MinLength(1) code: string;
}
