import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { OrdersService } from './orders.service';
import { PlaceOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Optional auth — works for both a logged-in customer (address book,
  // account email) and a guest (inline address + email in the DTO,
  // cart identified by x-session-id instead of a user).
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  placeOrder(
    @Req() req: Request,
    @Headers('x-session-id') sessionId: string,
    @Body() dto: PlaceOrderDto,
  ) {
    const user = req.user as { userId: string } | null;
    return this.ordersService.placeOrder(user?.userId || null, sessionId || null, dto);
  }

  // Also optional auth — a guest needs to reach their own just-placed
  // order's confirmation page with no account, authenticated instead by
  // the email they checked out with (see findByOrderNumberForConfirmation).
  @Get('confirmation/:orderNumber')
  @UseGuards(OptionalJwtAuthGuard)
  getConfirmation(
    @Req() req: Request,
    @Param('orderNumber') orderNumber: string,
    @Query('email') email?: string,
  ) {
    const user = req.user as { userId: string } | null;
    return this.ordersService.findByOrderNumberForConfirmation(orderNumber, user?.userId, email);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findMyOrders(@CurrentUser() user: { userId: string }) {
    return this.ordersService.findAllForUser(user.userId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: { userId: string; role: string }, @Param('id') id: string) {
    return this.ordersService.findOne(user.userId, id, user.role === UserRole.ADMIN);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status as OrderStatus);
  }
}
