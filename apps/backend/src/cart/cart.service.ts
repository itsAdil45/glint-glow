import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';
import { CouponsService } from '../coupons/coupons.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productsService: ProductsService,
    private couponsService: CouponsService,
  ) {}

  private async findOrCreateCart(userId: string | null, sessionId: string | null) {
    if (userId) {
      let cart = await this.cartModel.findOne({ userId }).exec();
      if (!cart) cart = new this.cartModel({ userId, items: [] });
      return cart;
    }
    if (!sessionId) throw new BadRequestException('sessionId is required for guest carts');
    let cart = await this.cartModel.findOne({ sessionId }).exec();
    if (!cart) cart = new this.cartModel({ sessionId, items: [] });
    return cart;
  }

  async getCart(userId: string | null, sessionId: string | null) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    return this.withDetails(cart);
  }

  /** Enriches raw cart items with live product data (title/image/current stock) for display. */
  private async withDetails(cart: CartDocument) {
    const items = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const { product, price, stock, variation } = await this.productsService.resolveVariant(
            item.productId.toString(),
            item.variationSku,
          );
          return {
            productId: item.productId,
            variationSku: item.variationSku,
            quantity: item.quantity,
            unitPrice: price,
            lineTotal: price * item.quantity,
            title: product.title,
            slug: product.slug,
            image: variation?.images?.[0]?.url || product.images?.[0]?.url,
            attributes: variation?.attributes || null,
            availableStock: stock,
          };
        } catch {
          return null; // product/variation no longer exists — skip
        }
      }),
    );
    const validItems = items.filter(Boolean);
    const subtotal = validItems.reduce((sum, i: any) => sum + i.lineTotal, 0);

    let couponCode: string | null = null;
    let discountAmount = 0;
    let couponError: string | null = null;

    if (cart.appliedCouponCode) {
      try {
        // Re-validated on every read, not just when first applied — a
        // coupon can expire, get deactivated, or hit its usage limit
        // between being applied and the cart being viewed again.
        const userId = cart.userId ? cart.userId.toString() : null;
        const result = await this.couponsService.validate(cart.appliedCouponCode, subtotal, userId, null);
        couponCode = result.coupon.code;
        discountAmount = result.discountAmount;
      } catch (err) {
        // Self-healing: an invalid coupon doesn't just silently fail to
        // discount, it gets cleared so it doesn't keep re-failing on
        // every future read. Reported back via couponError so the
        // storefront can tell the person what happened.
        couponError = err instanceof BadRequestException ? (err.getResponse() as any).message : 'This coupon is no longer valid';
        cart.appliedCouponCode = null;
        await cart.save();
      }
    }

    const total = Math.max(subtotal - discountAmount, 0);
    return { id: cart._id, items: validItems, subtotal, couponCode, discountAmount, total, couponError };
  }

  async applyCoupon(userId: string | null, sessionId: string | null, code: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const subtotal = await this.computeSubtotal(cart);
    // Throws with a customer-facing message on failure — surfaced as-is
    // to the caller, no need to catch here.
    await this.couponsService.validate(code, subtotal, userId, null);
    cart.appliedCouponCode = code.toUpperCase().trim();
    await cart.save();
    return this.withDetails(cart);
  }

  async removeCoupon(userId: string | null, sessionId: string | null) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    cart.appliedCouponCode = null;
    await cart.save();
    return this.withDetails(cart);
  }

  /** Subtotal only, without the full product-detail enrichment — used just to validate a coupon before applying it. */
  private async computeSubtotal(cart: CartDocument): Promise<number> {
    let subtotal = 0;
    for (const item of cart.items) {
      try {
        const { price } = await this.productsService.resolveVariant(
          item.productId.toString(),
          item.variationSku,
        );
        subtotal += price * item.quantity;
      } catch {
        // product/variation no longer exists — excluded, matching withDetails
      }
    }
    return subtotal;
  }

  async addItem(userId: string | null, sessionId: string | null, dto: AddCartItemDto) {
    const { price, stock } = await this.productsService.resolveVariant(
      dto.productId,
      dto.variationSku,
    );
    if (stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    const cart = await this.findOrCreateCart(userId, sessionId);
    const existing = cart.items.find(
      (i) => i.productId.toString() === dto.productId && i.variationSku === (dto.variationSku || null),
    );
    if (existing) {
      existing.quantity += dto.quantity;
      existing.priceSnapshot = price;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(dto.productId) as any,
        variationSku: dto.variationSku || null,
        quantity: dto.quantity,
        priceSnapshot: price,
      } as any);
    }
    await cart.save();
    return this.withDetails(cart);
  }

  async updateItem(
    userId: string | null,
    sessionId: string | null,
    productId: string,
    variationSku: string | undefined,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    const item = cart.items.find(
      (i) => i.productId.toString() === productId && i.variationSku === (variationSku || null),
    );
    if (!item) throw new NotFoundException('Cart item not found');

    const { stock } = await this.productsService.resolveVariant(productId, variationSku);
    if (stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    item.quantity = dto.quantity;
    await cart.save();
    return this.withDetails(cart);
  }

  async removeItem(
    userId: string | null,
    sessionId: string | null,
    productId: string,
    variationSku?: string,
  ) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    cart.items = cart.items.filter(
      (i) => !(i.productId.toString() === productId && i.variationSku === (variationSku || null)),
    ) as any;
    await cart.save();
    return this.withDetails(cart);
  }

  /** Called right after login: folds the guest (sessionId) cart into the user's persisted cart. */
  async mergeGuestCartIntoUser(userId: string, sessionId: string) {
    if (!sessionId) return;
    const guestCart = await this.cartModel.findOne({ sessionId }).exec();
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await this.cartModel.findOne({ userId }).exec();
    if (!userCart) userCart = new this.cartModel({ userId, items: [] });

    for (const gItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) =>
          i.productId.toString() === gItem.productId.toString() &&
          i.variationSku === gItem.variationSku,
      );
      if (existing) {
        existing.quantity += gItem.quantity;
      } else {
        userCart.items.push(gItem);
      }
    }
    // Only carries over if the user's own cart didn't already have one
    // applied — their own choice always wins. Re-validated on next read
    // regardless (see withDetails), so a coupon that turns out to violate
    // this specific user's per-user limit self-heals rather than sticking.
    if (guestCart.appliedCouponCode && !userCart.appliedCouponCode) {
      userCart.appliedCouponCode = guestCart.appliedCouponCode;
    }
    await userCart.save();
    await this.cartModel.deleteOne({ _id: guestCart._id }).exec();
  }

  async clearCart(userId: string | null, sessionId: string | null = null) {
    if (userId) {
      await this.cartModel.updateOne({ userId }, { items: [], appliedCouponCode: null }).exec();
    } else if (sessionId) {
      await this.cartModel.updateOne({ sessionId }, { items: [], appliedCouponCode: null }).exec();
    }
  }
}
