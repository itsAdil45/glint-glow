import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeroSlideDocument = HeroSlide & Document;

@Schema({ timestamps: true })
export class HeroSlide {
  @Prop({ trim: true })
  eyebrow?: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ trim: true })
  ctaLabel?: string;

  @Prop({ trim: true })
  ctaHref?: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: '' })
  imageAlt: string;

  @Prop({ default: 0, index: true })
  order: number;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const HeroSlideSchema = SchemaFactory.createForClass(HeroSlide);
