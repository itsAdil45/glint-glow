import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactMessageDocument = ContactMessage & Document;

@Schema({ timestamps: true })
export class ContactMessage {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  subject?: string;

  @Prop({ required: true, trim: true })
  message: string;

  // Lets the admin inbox distinguish unread submissions without deleting
  // anything — same read/unread shape as a typical support inbox.
  @Prop({ default: false, index: true })
  isRead: boolean;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
