import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RequestOtpDto, VerifyOtpDto, VerifyRegistrationOtpDto, ResendRegistrationOtpDto } from './dto/otp.dto';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.config.get('nodeEnv') === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  // Starts (or restarts, if never verified) email/password signup — sends
  // an OTP but does not create a usable/loggable-in account yet. The
  // account only becomes real once verifyRegisterOtp succeeds.
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/verify')
  async verifyRegisterOtp(@Body() dto: VerifyRegistrationOtpDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.verifyRegistrationOtp(
      dto.email,
      dto.otp,
    );
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('register/resend')
  async resendRegisterOtp(@Body() dto: ResendRegistrationOtpDto) {
    return this.authService.resendRegistrationOtp(dto.email);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('google')
  async google(@Body() dto: GoogleAuthDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.googleAuth(dto.idToken);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { userId: string };
    const { accessToken, refreshToken } = await this.authService.refresh(user.userId);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { message: 'Logged out' };
  }

  // Forgot password (not logged in) — requires email in body
  @Post('otp/request')
  async requestOtp(@Body() dto: RequestOtpDto) {
    if (!dto.email) throw new UnauthorizedException('Email is required');
    return this.authService.requestOtp(dto.email);
  }

  @Post('otp/verify-reset')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    if (!dto.email) throw new UnauthorizedException('Email is required');
    return this.authService.verifyOtpAndResetPassword(dto.email, dto.otp, dto.newPassword);
  }

  // Change password while logged in (account settings) — derives email from JWT
  @Post('otp/request-authenticated')
  @UseGuards(JwtAuthGuard)
  async requestOtpAuthenticated(@CurrentUser() user: { email: string }) {
    return this.authService.requestOtp(user.email);
  }

  @Post('otp/verify-authenticated')
  @UseGuards(JwtAuthGuard)
  async verifyOtpAuthenticated(
    @CurrentUser() user: { email: string },
    @Body() dto: VerifyOtpDto,
  ) {
    return this.authService.verifyOtpAndResetPassword(user.email, dto.otp, dto.newPassword);
  }
}
