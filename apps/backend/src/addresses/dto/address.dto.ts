import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString() @MinLength(2) fullName: string;
  @IsString() @MinLength(6) phone: string;
  @IsString() @MinLength(2) line1: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() @MinLength(1) city: string;
  @IsOptional() @IsString() state?: string;
  @IsString() @MinLength(1) postalCode: string;
  @IsString() @MinLength(2) country: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() line1?: string;
  @IsOptional() @IsString() line2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
