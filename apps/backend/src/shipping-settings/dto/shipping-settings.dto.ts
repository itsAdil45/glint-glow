import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateShippingSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  flatFee?: number;

  @IsOptional()
  @IsBoolean()
  freeShippingCapEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingCap?: number;
}
