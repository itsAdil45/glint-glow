import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BannerDocument = Banner & Document;

export type BannerLayout = "split" | "full-bleed";
export type BannerImagePosition = "left" | "right";
export type BannerTheme = "dark" | "light";

@Schema({ timestamps: true })
export class Banner {
  @Prop({ trim: true })
  eyebrow?: string;

  @Prop({ trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  ctaLabel?: string;

  @Prop({ trim: true })
  ctaHref?: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: "" })
  imageAlt: string;

  // 'split': text on one side, image on the other, on a solid/gradient background.
  // 'full-bleed': image fills the whole banner with text overlaid on top.
  @Prop({ default: "split", enum: ["split", "full-bleed"] })
  layout: BannerLayout;

  // Only relevant for the 'split' layout.
  @Prop({ default: "right", enum: ["left", "right"] })
  imagePosition: BannerImagePosition;

  @Prop({ default: "dark", enum: ["dark", "light"] })
  theme: BannerTheme;

  // Where this banner sits relative to the fixed homepage rows. Rows are
  // spaced 10 apart (see storefront home page) — set a value between two
  // rows to slot the banner in that gap.
  @Prop({ default: 0, index: true })
  position: number;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
