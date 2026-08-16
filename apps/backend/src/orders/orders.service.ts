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
    private config: ConfigService,
  ) {}

  private async generateOrderNumber() {
    const count = await this.orderModel.countDocuments().exec();
    const year = new Date().getFullYear();
    return `ORD-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }

  async placeOrder(userId: string, dto: PlaceOrderDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const address = await this.addressesService
      .findAllForUser(userId)
      .then((addrs) => addrs.find((a) => a._id.toString() === dto.addressId));
    if (!address) throw new NotFoundException('Address not found');

    const cart = await this.cartService.getCart(userId, null);
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
    const shippingFee = 0; // flat/free — adjust as needed
    const total = subtotal + shippingFee;

    const orderNumber = await this.generateOrderNumber();

    const order = new this.orderModel({
      orderNumber,
      userId,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      shippingAddress: {
        fullName: address.fullName,
        phone: dto.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
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

    await this.cartService.clearCart(userId);

    // Emails — customer confirmation + admin notification (required)
    await this.mailService.sendOrderConfirmation(user.email, order.orderNumber, order.total);
    const adminEmail = this.config.get('mail.adminNotificationEmail');
    if (adminEmail) {
      await this.mailService.sendAdminNewOrderNotification(
        adminEmail,
        order.orderNumber,
        user.name,
        user.email,
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
    if (!isAdmin && order.userId.toString() !== userId) throw new ForbiddenException();
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderModel.findByIdAndUpdate(orderId, { status }, { new: true }).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
