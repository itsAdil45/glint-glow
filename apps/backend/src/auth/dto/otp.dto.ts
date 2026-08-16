import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RequestOtpDto {
  // required for forgot-password (not logged in) flow; ignored/derived from
  // the authenticated user for the logged-in change-password flow
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsIn(['password_reset'])
  purpose: 'password_reset';
}

export class VerifyOtpDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
