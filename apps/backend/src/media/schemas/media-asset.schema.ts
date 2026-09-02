import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaAssetDocument = MediaAsset & Document;

@Schema({ timestamps: true })
export class MediaAsset {
  @Prop({ required: true })
  url: string;

  @Prop()
  thumbnailUrl?: string;

  // Cloudinary's identifier for this upload — not used for anything yet,
  // but kept in case a future feature (e.g. delete-from-Cloudinary) needs
  // it, so we don't have to re-derive it from the URL later.
  @Prop()
  publicId?: string;

  // Original filename at upload time, purely for the library's search box.
  @Prop({ trim: true })
  filename?: string;

  @Prop({ trim: true, default: '' })
  alt: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  bytes?: number;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
// Supports the library's search-by-filename box without a full collection scan.
MediaAssetSchema.index({ filename: 'text' });
