import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+passwordHash');
    return query.exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(data: { name: string; email: string; password: string; phone?: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
    });
    return user.save();
  }

  async validatePassword(user: UserDocument, plain: string) {
    // Google-only accounts have no passwordHash — bcrypt.compare would
    // throw on undefined, so fail closed instead (same "invalid email or
    // password" the user sees for any other wrong-credentials case, rather
    // than leaking that this account has no password set).
    if (!user.passwordHash) return false;
    return bcrypt.compare(plain, user.passwordHash);
  }

  findByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId }).exec();
  }

  async createFromGoogle(data: { name: string; email: string; googleId: string }) {
    const user = new this.userModel({
      name: data.name,
      email: data.email.toLowerCase(),
      googleId: data.googleId,
      // Google has already verified this address (checked by the caller
      // before ever reaching here), so there's no OTP step to gate on.
      isEmailVerified: true,
    });
    return user.save();
  }

  linkGoogleId(userId: string, googleId: string) {
    return this.userModel.findByIdAndUpdate(userId, { googleId, isEmailVerified: true }, { new: true }).exec();
  }

  async updateProfile(userId: string, data: Partial<{ name: string; phone: string }>) {
    return this.userModel.findByIdAndUpdate(userId, data, { new: true }).exec();
  }

  async setOtp(userId: string, codeHash: string, purpose: 'password_reset' | 'email_verify', expiresAt: Date) {
    return this.userModel
      .findByIdAndUpdate(userId, { otp: { codeHash, purpose, expiresAt } }, { new: true })
      .exec();
  }

  async clearOtp(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, { otp: null }).exec();
  }

  async updatePassword(userId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.userModel.findByIdAndUpdate(userId, { passwordHash, otp: null }).exec();
  }

  async findByIdWithOtp(id: string) {
    return this.userModel.findById(id).select('+passwordHash').exec();
  }
}
