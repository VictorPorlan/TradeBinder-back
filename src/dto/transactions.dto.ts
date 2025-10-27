import { IsEnum, IsNumber, IsOptional, IsString, IsDecimal, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class CreateTransactionDto {
  @IsNumber()
  @Type(() => Number)
  listingId: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  quantity: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

export class TransactionResponseDto {
  id: number;
  listingId: number;
  buyerId: number;
  sellerId: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: number;
    cardBase: {
      id: number;
      name: string;
      imageUrl?: string;
    };
    edition: {
      id: number;
      name: string;
    };
    condition: string;
    price: number;
  };
  buyer?: {
    id: number;
    username: string;
    email: string;
  };
  seller?: {
    id: number;
    username: string;
    email: string;
  };
}

export class SearchTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  listingId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buyerId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sellerId?: number;

  @IsOptional()
  @IsString()
  type?: 'buyer' | 'seller' | 'all';

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CompleteTransactionDto {
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
