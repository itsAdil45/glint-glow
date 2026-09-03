import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString() @MinLength(2) @MaxLength(100) name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsString() @MaxLength(150) subject?: string;
  @IsString() @MinLength(10) @MaxLength(2000) message: string;
}

export class UpdateContactMessageDto {
  @IsOptional() @IsBoolean() isRead?: boolean;
}
