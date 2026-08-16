import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private async issueTokens(user: { _id: any; email: string; role: string }) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('jwt.accessSecret'),
      expiresIn: this.config.get('jwt.accessExpiresIn'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('jwt.refreshSecret'),
      expiresIn: this.config.get('jwt.refreshExpiresIn'),
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email is already registered');

    const user = await this.usersService.create(dto);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await this.usersService.validatePassword(user, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return this.issueTokens(user);
  }

  async refresh(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  // ---- OTP-based password reset / change ----

  async requestOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Do not reveal whether the email exists
    if (!user) return { message: 'If that email exists, a code has been sent.' };

    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.setOtp(user._id.toString(), codeHash, 'password_reset', expiresAt);
    await this.mailService.sendOtp(user.email, code, 'password_reset');

    return { message: 'If that email exists, a code has been sent.' };
  }

  async verifyOtpAndResetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.otp || user.otp.purpose !== 'password_reset') {
      throw new BadRequestException('Invalid or expired code');
    }
    if (user.otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Code has expired, please request a new one');
    }
    const valid = await bcrypt.compare(otp, user.otp.codeHash);
    if (!valid) throw new BadRequestException('Invalid code');

    await this.usersService.updatePassword(user._id.toString(), newPassword);
    return { message: 'Password updated successfully' };
  }
}
