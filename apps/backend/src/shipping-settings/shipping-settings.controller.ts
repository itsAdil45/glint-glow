import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ShippingSettingsService } from './shipping-settings.service';
import { UpdateShippingSettingsDto } from './dto/shipping-settings.dto';

@Controller('shipping-settings')
export class ShippingSettingsController {
  constructor(private shippingSettingsService: ShippingSettingsService) {}

  // Public — the storefront needs this (logged in or not) to show an
  // accurate shipping estimate in cart/checkout before an order exists.
  @Get()
  getSettings() {
    return this.shippingSettingsService.getSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Body() dto: UpdateShippingSettingsDto) {
    return this.shippingSettingsService.updateSettings(dto);
  }
}
