import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument, ReviewStatus } from './schemas/review.schema';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/schemas/order.schema';
import { ProductsService } from '../products/products.service';
import { CreateReviewDto, ModerateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  findApprovedForProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) return Promise.resolve([]);
    return this.reviewModel
      .find({ productId, status: ReviewStatus.APPROVED })
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .exec();
  }

  // Tells the storefront whether to show the "write a review" form for this
  // product, and if not, why (already reviewed vs. no delivered order yet).
  async checkEligibility(userId: string, productId: string) {
    const existing = await this.reviewModel.findOne({ userId, productId }).exec();
    if (existing) {
      return { canReview: false, reason: 'already_reviewed' as const, status: existing.status };
    }

    const orders = await this.ordersService.findAllForUser(userId);
    const qualifyingOrder = orders.find(
      (order) =>
        order.status === OrderStatus.DELIVERED &&
        order.items.some((item) => item.productId.toString() === productId),
    );
    if (!qualifyingOrder) {
      return { canReview: false, reason: 'not_delivered' as const };
    }

    return { canReview: true as const, orderId: qualifyingOrder._id.toString() };
  }

  findMine(userId: string) {
    return this.reviewModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate('productId', 'title slug images')
      .exec();
  }

  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.reviewModel.findOne({ userId, productId: dto.productId }).exec();
    if (existing) throw new ConflictException('You have already reviewed this product');

    const order = await this.ordersService.findOne(userId, dto.orderId, false).catch(() => null);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('You can only review products from delivered orders');
    }
    const hasProduct = order.items.some((item) => item.productId.toString() === dto.productId);
    if (!hasProduct) {
      throw new BadRequestException('This order does not contain that product');
    }

    const review = new this.reviewModel({
      productId: dto.productId,
      userId,
      orderId: dto.orderId,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      status: ReviewStatus.PENDING,
    });
    return review.save();
  }

  findAllAdmin(status?: ReviewStatus) {
    const filter = status ? { status } : {};
    return this.reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('productId', 'title slug images')
      .exec();
  }

  async moderate(id: string, moderatorId: string, dto: ModerateReviewDto) {
    if (dto.status === 'rejected' && !dto.rejectionReason) {
      throw new BadRequestException('A reason is required when rejecting a review');
    }

    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');

    review.status = dto.status === 'approved' ? ReviewStatus.APPROVED : ReviewStatus.REJECTED;
    review.rejectionReason = dto.status === 'rejected' ? dto.rejectionReason : undefined;
    review.moderatedBy = new Types.ObjectId(moderatorId);
    review.moderatedAt = new Date();
    await review.save();

    await this.recomputeProductRating(review.productId.toString());
    return review;
  }

  async remove(id: string) {
    const review = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    await this.recomputeProductRating(review.productId.toString());
    return { message: 'Review removed' };
  }

  private async recomputeProductRating(productId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId), status: ReviewStatus.APPROVED } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = stats[0] || {};
    await this.productsService.updateRatingSummary(productId, Math.round(avg * 10) / 10, count);
  }
}
