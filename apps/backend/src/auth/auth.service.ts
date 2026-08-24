import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get<string>('google.clientId'));
  }

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
    if (existing?.isEmailVerified) {
      throw new ConflictException('Email is already registered');
    }

    // No account yet, or a previous attempt for this email was never
    // verified — either way, (re)write the pending signup and send a fresh
    // code. The account itself isn't created (in the sense of being usable
    // to log in) until that code is confirmed in verifyRegistrationOtp.
    const user = existing
      ? await this.usersService.updatePendingRegistration(existing._id.toString(), dto)
      : await this.usersService.create(dto);
    if (!user) throw new BadRequestException('Could not start registration');

    await this.sendEmailVerificationOtp(user);
    return { message: 'We sent a verification code to your email.', email: user.email };
  }

  async verifyRegistrationOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid or expired code');

    if (!user.isEmailVerified) {
      if (!user.otp || user.otp.purpose !== 'email_verify') {
        throw new BadRequestException('Invalid or expired code');
      }
      if (user.otp.expiresAt.getTime() < Date.now()) {
        throw new BadRequestException('Code has expired, please request a new one');
      }
      const valid = await bcrypt.compare(otp, user.otp.codeHash);
      if (!valid) throw new BadRequestException('Invalid code');

      await this.usersService.markEmailVerified(user._id.toString());
    }

    return this.issueTokens(user);
  }

  async resendRegistrationOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No pending signup found for this email — please sign up again');
    }
    if (user.isEmailVerified) {
      throw new ConflictException('This email is already verified — please log in');
    }

    await this.sendEmailVerificationOtp(user);
    return { message: 'We sent a new verification code to your email.' };
  }

  private async sendEmailVerificationOtp(user: { _id: any; email: string }) {
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.setOtp(user._id.toString(), codeHash, 'email_verify', expiresAt);
    await this.mailService.sendOtp(user.email, code, 'email_verify');
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await this.usersService.validatePassword(user, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in',
      });
    }

    return this.issueTokens(user);
  }

  async refresh(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  async googleAuth(idToken: string) {
    const clientId = this.config.get<string>('google.clientId');
    if (!clientId) {
      // Fails loudly rather than silently accepting tokens with no
      // audience check, which would be a much worse failure mode.
      throw new BadRequestException('Google sign-in is not configured');
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google sign-in — please try again');
    }
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google sign-in — please try again');
    }
    // Google itself gates whether an account can reach this state (email
    // changes, unverified addresses, etc.), so this is the one signal that
    // actually matters for deciding whether to trust the email for
    // auto-linking — everything else in the payload is just profile data.
    if (!payload.email_verified) {
      throw new UnauthorizedException('Your Google email is not verified');
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];

    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      const existingByEmail = await this.usersService.findByEmail(email);
      if (existingByEmail) {
        // Auto-link: Google has already verified ownership of this inbox,
        // so a pre-existing password account with the same address is the
        // same person signing in through a different door — not a
        // collision to reject.
        user = await this.usersService.linkGoogleId(existingByEmail._id.toString(), googleId);
      } else {
        user = await this.usersService.createFromGoogle({ name, email, googleId });
      }
    }

    if (!user) throw new UnauthorizedException('Could not sign in with Google');
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
