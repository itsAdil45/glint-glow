import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponRedemptionDocument = CouponRedemption & Document;

/**
 * One row per successful order that used a coupon. Exists separately from
 * Coupon.usedCount (a simple running total) so per-user limits can be
 * enforced accurately — "has this specific customer already used this
 * code" needs a queryable record, not just a counter — and so admins have
 * an audit trail of who redeemed what.
 */
@Schema({ timestamps: true })
export class CouponRedemption {
  @Prop({ type: Types.ObjectId, ref: 'Coupon', required: true, index: true })
  couponId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  // Set only for a guest checkout, mirroring how Order distinguishes a
  // registered customer from a guest.
  @Prop({ trim: true, lowercase: true, index: true })
  guestEmail?: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  discountAmount: number;
}

export const CouponRedemptionSchema = SchemaFactory.createForClass(CouponRedemption);
