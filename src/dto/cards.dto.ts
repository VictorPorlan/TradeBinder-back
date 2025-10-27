import { IsOptional, IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCardsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  manaCost?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  subtype?: string;

  @IsOptional()
  @IsString()
  rarity?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsString()
  text?: string;

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
  sortBy?: string = 'name';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class CardResponseDto {
  id: number;
  name: string;
  manaCost?: string;
  type?: string;
  subtype?: string;
  rarity?: string;
  text?: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: number;
  imageUrl?: string;
  artist?: string;
  number?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedCardsResponseDto {
  data: CardResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
