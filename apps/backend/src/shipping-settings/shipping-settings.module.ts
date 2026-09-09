import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingSettings, ShippingSettingsSchema } from './schemas/shipping-settings.schema';
import { ShippingSettingsService } from './shipping-settings.service';
import { ShippingSettingsController } from './shipping-settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShippingSettings.name, schema: ShippingSettingsSchema }]),
  ],
  providers: [ShippingSettingsService],
  controllers: [ShippingSettingsController],
  exports: [ShippingSettingsService],
})
export class ShippingSettingsModule {}
