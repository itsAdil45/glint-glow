import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // The delivered order this review is backed by — proof of purchase,
  // kept even if the review is later edited/re-moderated.
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true, maxlength: 120 })
  title?: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  comment: string;

  @Prop({ type: String, enum: ReviewStatus, default: ReviewStatus.PENDING, index: true })
  status: ReviewStatus;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  moderatedBy?: Types.ObjectId;

  @Prop()
  moderatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// One review per customer per product. There's no separate edit/resubmit
// flow yet — if that's needed later (e.g. after a rejection), it can be
// layered on top of this constraint.
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
