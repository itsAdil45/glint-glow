import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShippingSettingsDocument = ShippingSettings & Document;

// Singleton — there is only ever one document in this collection (see
// ShippingSettingsService.getSettings, which creates it on first read).
@Schema({ timestamps: true })
export class ShippingSettings {
  // Applied whenever the free-shipping cap is off, or the order subtotal
  // is below it.
  @Prop({ required: true, min: 0, default: 200 })
  flatFee: number;

  // When true, orders at or above freeShippingCap get free delivery
  // instead of flatFee. When false, flatFee always applies regardless of
  // order size.
  @Prop({ default: true })
  freeShippingCapEnabled: boolean;

  @Prop({ required: true, min: 0, default: 2500 })
  freeShippingCap: number;
}

export const ShippingSettingsSchema = SchemaFactory.createForClass(ShippingSettings);
