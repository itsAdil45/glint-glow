import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingSettings, ShippingSettingsDocument } from './schemas/shipping-settings.schema';
import { UpdateShippingSettingsDto } from './dto/shipping-settings.dto';

@Injectable()
export class ShippingSettingsService {
  constructor(
    @InjectModel(ShippingSettings.name)
    private settingsModel: Model<ShippingSettingsDocument>,
  ) {}

  async getSettings() {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      // First read ever — create the one document with schema defaults.
      settings = await new this.settingsModel({}).save();
    }
    return settings;
  }

  async updateSettings(dto: UpdateShippingSettingsDto) {
    const settings = await this.getSettings();
    Object.assign(settings, dto);
    return settings.save();
  }

  // The one authoritative place delivery cost gets decided — used both by
  // OrdersService when actually placing an order and, indirectly, by the
  // storefront's own estimate (which mirrors this same comparison against
  // the settings returned by GET /shipping-settings, but never gets
  // trusted as the real charged amount).
  async calculateFee(subtotal: number): Promise<number> {
    const settings = await this.getSettings();
    if (settings.freeShippingCapEnabled && subtotal >= settings.freeShippingCap) {
      return 0;
    }
    return settings.flatFee;
  }
}
