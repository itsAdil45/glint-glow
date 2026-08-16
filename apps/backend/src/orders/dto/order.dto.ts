import { IsIn, IsString, MinLength } from 'class-validator';

export class PlaceOrderDto {
  @IsString() @MinLength(1) addressId: string;
  @IsString() @MinLength(6) phone: string;
}

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  status: string;
}
