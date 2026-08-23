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

  // Optional because a Google-only account (no password ever set) has
  // nothing to hash. Every write path that creates/updates a password
  // still goes through bcrypt as before — this only relaxes the schema
  // requirement for accounts that never had one.
  @Prop({ select: false })
  passwordHash?: string;

  // Sparse + unique: most users won't have this, and Mongo's unique index
  // ignores documents missing the field entirely (sparse), so multiple
  // password-only accounts with no googleId don't collide with each other.
  @Prop({ index: true, sparse: true, unique: true })
  googleId?: string;

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
