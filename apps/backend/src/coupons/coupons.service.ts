import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument, CouponType } from './schemas/coupon.schema';
import { CouponRedemption, CouponRedemptionDocument } from './schemas/coupon-redemption.schema';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

export interface CouponValidationResult {
  coupon: CouponDocument;
  discountAmount: number;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(CouponRedemption.name)
    private redemptionModel: Model<CouponRedemptionDocument>,
  ) {}

  // ---- Admin CRUD ----

  create(dto: CreateCouponDto) {
    return new this.couponModel({ ...dto, code: dto.code.toUpperCase() }).save();
  }

  findAllAdmin() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async update(id: string, dto: UpdateCouponDto) {
    const update = dto.code ? { ...dto, code: dto.code.toUpperCase() } : dto;
    const coupon = await this.couponModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async remove(id: string) {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Coupon not found');
    return { message: 'Coupon removed' };
  }

  /**
   * The single source of truth for "is this coupon usable right now, by
   * this person, on this cart" — used by both the cart apply-coupon
   * endpoint (for a live preview) and order placement (final, authoritative
   * check). Throws with a customer-facing message on any failure rather
   * than returning a boolean, since the caller always needs to explain
   * *why* to the person applying the code.
   */
  async validate(
    code: string,
    subtotal: number,
    userId: string | null,
    guestEmail: string | null,
  ): Promise<CouponValidationResult> {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase().trim() }).exec();
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('This coupon code is invalid');
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new BadRequestException('This coupon is not active yet');
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      throw new BadRequestException(
        `This coupon requires a minimum order of ${coupon.minOrderValue}`,
      );
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    if (coupon.usageLimitPerUser != null) {
      // A guest is identified by email (matching how Order distinguishes
      // guest orders), which isn't collected until checkout — so a guest
      // applying a coupon while just viewing their cart has no identity
      // to check yet. Rather than block that (a false rejection for most
      // guests), this check is skipped when there's truly no identity
      // available, and re-run — authoritatively, with the real checkout
      // email — as part of order placement, which always has one or the
      // other by the time it calls validate().
      const identity = userId
        ? { userId: new Types.ObjectId(userId) }
        : guestEmail
          ? { guestEmail: guestEmail.toLowerCase() }
          : null;
      if (identity) {
        const priorUses = await this.redemptionModel.countDocuments({
          couponId: coupon._id,
          ...identity,
        });
        if (priorUses >= coupon.usageLimitPerUser) {
          throw new BadRequestException('You have already used this coupon');
        }
      }
    }

    const discountAmount = this.calculateDiscount(coupon, subtotal);
    if (discountAmount <= 0) {
      throw new BadRequestException('This coupon does not apply to your order');
    }

    return { coupon, discountAmount };
  }

  /**
   * Pure calculation, no DB/validation — kept separate from validate() so
   * a caller that has already validated (order placement, right after
   * calling validate()) doesn't need to re-derive the same number twice
   * with two chances to drift apart.
   */
  calculateDiscount(coupon: Coupon, subtotal: number): number {
    let discount =
      coupon.type === CouponType.PERCENTAGE ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscountAmount != null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
    // A discount can never exceed the subtotal itself — otherwise a fixed
    // coupon on a small order could drive the total negative.
    return Math.min(discount, subtotal);
  }

  /** Called once an order has actually been placed — never speculatively. */
  async recordRedemption(
    couponId: Types.ObjectId,
    orderId: Types.ObjectId,
    userId: string | null,
    guestEmail: string | null,
    discountAmount: number,
  ) {
    await this.couponModel.updateOne({ _id: couponId }, { $inc: { usedCount: 1 } }).exec();
    await new this.redemptionModel({
      couponId,
      orderId,
      userId: userId || undefined,
      guestEmail: userId ? undefined : guestEmail || undefined,
      discountAmount,
    }).save();
  }
}
