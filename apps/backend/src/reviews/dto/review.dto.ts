import { IsIn, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  productId: string;

  @IsMongoId()
  orderId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  comment: string;
}

export class ModerateReviewDto {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  // Required when status is 'rejected' — enforced in the service since it's
  // conditional on another field.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
