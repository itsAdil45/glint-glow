import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

@Schema({ _id: false })
class Otp {
  @Prop() codeHash: string;
  @Prop() purpose: 'password_reset' | 'email_verify';
  @Prop() expiresAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ type: [Types.ObjectId], ref: 'Address', default: [] })
  addresses: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Address', default: null })
  defaultAddressId: Types.ObjectId | null;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: Otp, default: null })
  otp: Otp | null;

  @Prop({ type: String, default: null, select: false })
  refreshTokenHash: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
