import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsEnum, 
  IsArray, 
  Min, 
  Max, 
  IsPositive,
  IsInt,
  ArrayMaxSize,
  MaxLength,
  MinLength
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ListingCondition {
  MINT = 'mint',
  NEAR_MINT = 'near_mint',
  LIGHTLY_PLAYED = 'lightly_played',
  MODERATELY_PLAYED = 'moderately_played',
  HEAVILY_PLAYED = 'heavily_played',
  DAMAGED = 'damaged',
}

export enum ListingStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
}

export class CreateListingDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cardId: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  editionId: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  locationId: number;

  @IsEnum(ListingCondition)
  condition: ListingCondition;

  @IsBoolean()
  @Type(() => Boolean)
  isFoil: boolean;

  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  images?: string[];
}

export class UpdateListingDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  locationId?: number;

  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFoil?: boolean;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  images?: string[];
}

export class UpdateListingStatusDto {
  @IsEnum(ListingStatus)
  status: ListingStatus;
}

export class SearchListingsDto {
  @IsOptional()
  @IsString()
  cardName?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cardId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  editionId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  locationId?: number;

  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFoil?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

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

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ListingResponseDto {
  id: number;
  userId: number;
  cardId: number;
  editionId: number;
  locationId: number;
  condition: ListingCondition;
  isFoil: boolean;
  price: number;
  quantity: number;
  description?: string;
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones expandidas
  user?: {
    id: number;
    username: string;
    location?: {
      id: number;
      name: string;
    };
  };
  
  cardBase?: {
    id: number;
    name: string;
    manaCost?: string;
    type?: string;
    rarity?: string;
    imageUrl?: string;
  };
  
  edition?: {
    id: number;
    name: string;
    releaseDate?: Date;
    hasFoil: boolean;
  };

  location?: {
    id: number;
    name: string;
  };
}

export class PaginatedListingsResponseDto {
  data: ListingResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
