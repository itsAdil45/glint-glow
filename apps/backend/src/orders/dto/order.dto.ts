import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class PlaceOrderDto {
  // Logged-in checkout — an existing saved address.
  @IsOptional()
  @IsString()
  addressId?: string;

  @IsString()
  @MinLength(6)
  phone: string;

  // Guest checkout — required (validated in the service, since it depends
  // on whether the request is authenticated) when there's no addressId.
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  line1?: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  country?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  status: string;
}
