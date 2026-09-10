import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { AddressesService } from '../addresses/addresses.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ShippingSettingsService } from '../shipping-settings/shipping-settings.service';
import { PlaceOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
    private addressesService: AddressesService,
    private productsService: ProductsService,
    private usersService: UsersService,
    private mailService: MailService,
    private shippingSettingsService: ShippingSettingsService,
    private config: ConfigService,
  ) {}

  private async generateOrderNumber() {
    const count = await this.orderModel.countDocuments().exec();
    const year = new Date().getFullYear();
    return `ORD-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }

  async placeOrder(userId: string | null, sessionId: string | null, dto: PlaceOrderDto) {
    let user: { email: string; name: string } | null = null;
    let addressSnapshot: {
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
    };
    let guestEmail: string | undefined;

    if (userId) {
      user = await this.usersService.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      if (!dto.addressId) throw new BadRequestException('Please select a shipping address');
      const address = await this.addressesService
        .findAllForUser(userId)
        .then((addrs) => addrs.find((a) => a._id.toString() === dto.addressId));
      if (!address) throw new NotFoundException('Address not found');

      addressSnapshot = {
        fullName: address.fullName,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    } else {
      // Guest checkout — the client has no saved address book, so the full
      // address (and an email, since there's no account to send the
      // confirmation to) comes inline on the DTO instead of an addressId.
      const required: (keyof PlaceOrderDto)[] = [
        'email',
        'fullName',
        'line1',
        'city',
        'postalCode',
        'country',
      ];
      for (const field of required) {
        if (!dto[field]) throw new BadRequestException(`${field} is required`);
      }
      guestEmail = dto.email;
      addressSnapshot = {
        fullName: dto.fullName!,
        line1: dto.line1!,
        line2: dto.line2,
        city: dto.city!,
        state: dto.state,
        postalCode: dto.postalCode!,
        country: dto.country!,
      };
    }

    const cart = await this.cartService.getCart(userId, sessionId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    // Re-validate stock at checkout time (prices/stock may have changed since add-to-cart)
    const orderItems = [];
    for (const item of cart.items as any[]) {
      const { product, price, stock, variation } = await this.productsService.resolveVariant(
        item.productId.toString(),
        item.variationSku,
      );
      if (stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.title}`);
      }
      orderItems.push({
        productId: product._id,
        title: product.title,
        variationSku: item.variationSku,
        attributes: variation?.attributes || {},
        quantity: item.quantity,
        price,
        image: variation?.images?.[0]?.url || product.images?.[0]?.url,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    // Server-computed, authoritative — never trust a client-supplied
    // shipping fee. The storefront shows its own estimate using the same
    // settings (GET /shipping-settings) purely for display before the
    // order exists.
    const shippingFee = await this.shippingSettingsService.calculateFee(subtotal);
    const total = subtotal + shippingFee;

    const orderNumber = await this.generateOrderNumber();

    const order = new this.orderModel({
      orderNumber,
      userId: userId || undefined,
      guestEmail: userId ? undefined : guestEmail,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      shippingAddress: {
        ...addressSnapshot,
        phone: dto.phone,
      },
      phone: dto.phone,
      status: OrderStatus.PENDING,
      paymentMethod: 'cod',
    });
    await order.save();

    // Decrement stock per line item
    for (const item of orderItems) {
      await this.productsService.decrementStock(
        item.productId.toString(),
        item.variationSku || null,
        item.quantity,
      );
    }

    await this.cartService.clearCart(userId, sessionId);

    // Emails — customer confirmation + admin notification (required)
    const confirmationEmail = user?.email || guestEmail!;
    const confirmationName = user?.name || addressSnapshot.fullName;
    await this.mailService.sendOrderConfirmation(confirmationEmail, order.orderNumber, order.total);
    const adminEmail = this.config.get('mail.adminNotificationEmail');
    if (adminEmail) {
      await this.mailService.sendAdminNewOrderNotification(
        adminEmail,
        order.orderNumber,
        confirmationName,
        confirmationEmail,
        order.total,
      );
    }

    return order;
  }

  findAllForUser(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  findAllAdmin() {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(userId: string, orderId: string, isAdmin: boolean) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.userId?.toString() !== userId) throw new ForbiddenException();
    return order;
  }

  // Used by the order-confirmation page, which a guest with no account
  // still needs to reach right after checkout. Order numbers are
  // sequential (not a secret), so this can't be a bare lookup-by-number —
  // an account order requires the caller to actually be its owner, and a
  // guest order requires the email it was placed with.
  async findByOrderNumberForConfirmation(orderNumber: string, userId?: string, email?: string) {
    const order = await this.orderModel.findOne({ orderNumber }).exec();
    if (!order) throw new NotFoundException('Order not found');

    if (order.userId) {
      if (!userId || order.userId.toString() !== userId) throw new ForbiddenException();
    } else {
      if (!email || order.guestEmail !== email.toLowerCase()) throw new ForbiddenException();
    }
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderModel.findByIdAndUpdate(orderId, { status }, { new: true }).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
