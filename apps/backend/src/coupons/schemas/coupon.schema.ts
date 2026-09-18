import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ type: String, enum: CouponType, required: true })
  type: CouponType;

  // Percentage (0-100) or a fixed currency amount, depending on `type`.
  @Prop({ required: true, min: 0 })
  value: number;

  // Caps how much a percentage coupon can take off a single order (e.g.
  // "20% off, up to Rs. 1000") — meaningless for a fixed coupon, so left
  // undefined there.
  @Prop({ min: 0 })
  maxDiscountAmount?: number;

  // Cart subtotal must be at least this before the coupon can be applied.
  @Prop({ min: 0, default: 0 })
  minOrderValue: number;

  // Total redemptions allowed across every customer combined. Undefined
  // means unlimited.
  @Prop({ min: 1 })
  usageLimit?: number;

  // Redemptions allowed per customer (matched by userId, or guestEmail for
  // guest checkout). Undefined means unlimited per person.
  @Prop({ min: 1 })
  usageLimitPerUser?: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop()
  startsAt?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: true, index: true })
  isActive: boolean;

  // Admin-facing note only (e.g. "Instagram launch promo") — never shown
  // to the customer.
  @Prop({ trim: true })
  description?: string;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
