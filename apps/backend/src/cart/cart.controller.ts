import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  private ids(req: Request, sessionId?: string) {
    const user = req.user as { userId: string } | null;
    return { userId: user?.userId || null, sessionId: sessionId || null };
  }

  @Get()
  get(@Req() req: Request, @Headers('x-session-id') sessionId: string) {
    const { userId, sessionId: sid } = this.ids(req, sessionId);
    return this.cartService.getCart(userId, sid);
  }

  @Post('items')
  addItem(
    @Req() req: Request,
    @Headers('x-session-id') sessionId: string,
    @Body() dto: AddCartItemDto,
  ) {
    const { userId, sessionId: sid } = this.ids(req, sessionId);
    return this.cartService.addItem(userId, sid, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @Req() req: Request,
    @Headers('x-session-id') sessionId: string,
    @Param('productId') productId: string,
    @Query('variationSku') variationSku: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const { userId, sessionId: sid } = this.ids(req, sessionId);
    return this.cartService.updateItem(userId, sid, productId, variationSku, dto);
  }

  @Delete('items/:productId')
  removeItem(
    @Req() req: Request,
    @Headers('x-session-id') sessionId: string,
    @Param('productId') productId: string,
    @Query('variationSku') variationSku: string,
  ) {
    const { userId, sessionId: sid } = this.ids(req, sessionId);
    return this.cartService.removeItem(userId, sid, productId, variationSku);
  }

  // Called by the frontend immediately after a successful login
  @Post('merge')
  merge(@Req() req: Request, @Headers('x-session-id') sessionId: string) {
    const user = req.user as { userId: string } | null;
    if (!user) return { message: 'Not authenticated' };
    return this.cartService.mergeGuestCartIntoUser(user.userId, sessionId).then(() =>
      this.cartService.getCart(user.userId, null),
    );
  }
}
